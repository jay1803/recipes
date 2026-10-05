const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const recipeLinks = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .matchAll(/class="recipe-card" href="([^"]+)"/g)].map((match) => match[1]);
const techniquePages = fs.readdirSync(path.join(root, 'techniques'))
  .filter((file) => file.endsWith('.html')).map((file) => 'techniques/' + file);

function storage() {
  const entries = new Map();
  return {
    entries,
    async open(name) {
      if (!entries.has(name)) entries.set(name, new Map());
      const cache = entries.get(name);
      return {
        async addAll(requests) {
          const pending = requests.map((request) => {
            const file = new URL(request.url).pathname.replace(/^\/recipes\//, '');
            return [request.url, new Response(fs.readFileSync(path.join(root, file)))];
          });
          // Commit only after every resource has loaded, like Cache.addAll.
          pending.forEach(([url, response]) => cache.set(url, response));
        },
        async match(url) { return cache.get(typeof url === 'string' ? url : url.url)?.clone(); }
      };
    },
    async keys() { return [...entries.keys()]; },
    async delete(name) { return entries.delete(name); }
  };
}

function worker(code = source, caches = storage()) {
  const handlers = {};
  const state = { skipped: false, claimed: false, offline: false, fetched: [] };
  const self = {
    registration: { scope: 'https://example.test/recipes/' },
    addEventListener(type, handler) { handlers[type] = handler; },
    async skipWaiting() { state.skipped = true; },
    clients: { async claim() { state.claimed = true; } }
  };
  vm.runInNewContext(code, {
    self, caches, URL, Request, Response, Set,
    async fetch(request) {
      state.fetched.push(request.url);
      if (state.offline) throw new TypeError('Offline');
      return new Response('network response');
    }
  });
  return {
    caches, state,
    async dispatch(type, extra = {}) {
      let result;
      handlers[type]({ ...extra, waitUntil(promise) { result = promise; }, respondWith(promise) { result = promise; } });
      return result;
    },
    async navigate(file) {
      return this.dispatch('fetch', { request: { url: 'https://example.test/recipes/' + file, method: 'GET', mode: 'navigate' } });
    }
  };
}

test('offline inventory/version is current and every reading page includes app metadata', () => {
  execFileSync('python3', ['scripts/update-offline.py', '--check'], { cwd: root });
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest')));
  assert.equal(manifest.display, 'standalone');
  manifest.icons.forEach((icon) => assert.ok(fs.existsSync(path.join(root, icon.src))));
  assert.ok(recipeLinks.length > 0);
  assert.equal(new Set(recipeLinks).size, recipeLinks.length);
  for (const file of ['index.html', ...recipeLinks]) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /rel="manifest"/);
    assert.match(html, /src="(?:\.\.\/)?pwa.js" defer/);
    assert.match(html, /href="(?:\.\.\/)?pwa.css"/);
    if (file !== 'index.html') assert.match(html, /src="\.\.\/reminders.js" defer/);
    assert.ok(source.includes('"' + file + '"'), file + ' must be precached');
  }
  for (const file of techniquePages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /rel="manifest"/);
    assert.match(html, /src="\.\.\/pwa.js" defer/);
    assert.match(html, /href="\.\.\/pwa.css"/);
    assert.ok(source.includes('"' + file + '"'), file + ' must be precached');
  }
});

test('first installation saves every recipe; offline home aliases, filters assets and unopened pages work', async () => {
  const app = worker();
  await app.dispatch('install');
  await app.dispatch('activate');
  assert.ok(app.state.skipped && app.state.claimed);
  app.state.offline = true;
  for (const file of ['', 'index.html?from=home', 'styles.css', 'pwa.js', 'pwa.css', 'reminders.js', 'shortcuts/recipe-ingredients.shortcut']) {
    assert.ok((await app.navigate(file)).ok, file);
  }
  for (const file of recipeLinks) assert.match(await (await app.navigate(file)).text(), /class="ingredients"/, file);
  for (const file of techniquePages) {
    const html = await (await app.navigate(file + '#method')).text();
    assert.match(html, /公共步骤/, file);
    assert.ok(!html.includes('class="ingredients"'), file);
  }
  assert.equal(app.state.fetched.length, 0);
  let status;
  await app.dispatch('message', { data: { type: 'OFFLINE_STATUS' }, ports: [{ postMessage(value) { status = value; } }] });
  assert.equal(status.ready, true);
  assert.equal(status.recipeCount, recipeLinks.length);
});

test('missing shared technique prevents readiness without increasing the recipe count', async () => {
  const app = worker();
  await app.dispatch('install');
  const cache = [...app.caches.entries.values()][0];
  cache.delete('https://example.test/recipes/' + techniquePages[0]);
  let status;
  await app.dispatch('message', { data: { type: 'OFFLINE_STATUS' }, ports: [{ postMessage(value) { status = value; } }] });
  assert.equal(status.ready, false);
  assert.equal(status.recipeCount, recipeLinks.length);
});

test('failed update leaves the complete old version active, and successful update removes only its own old caches', async () => {
  const old = worker();
  await old.dispatch('install');
  await old.dispatch('activate');
  const oldNames = await old.caches.keys();
  const broken = worker(source.replace('index.html"', 'missing.html"'), old.caches);
  await assert.rejects(broken.dispatch('install'));
  assert.equal(broken.state.skipped, false);
  assert.equal(broken.state.claimed, false);
  old.state.offline = true;
  assert.ok((await old.navigate('chicken/chicken-shawarma.html')).ok);
  await old.caches.open('unrelated-app');
  await old.caches.open('recipes-offline-/another-app/:old');
  const updated = worker(source.replace(/(CACHE_PREFIX \+ ')[^']+/, '$1next-version'), old.caches);
  await updated.dispatch('install');
  await updated.dispatch('activate');
  const names = await old.caches.keys();
  assert.ok(!names.includes(oldNames[0]));
  assert.ok(names.includes('unrelated-app'));
  assert.ok(names.includes('recipes-offline-/another-app/:old'));
  updated.state.offline = true;
  assert.ok((await updated.navigate('vegetable/pea-shoots-three-ways.html')).ok);
});

test('readiness reflects missing cached pages and offline fallback links resolve from the app root', async () => {
  const app = worker();
  await app.dispatch('install');
  const cache = [...app.caches.entries.values()][0];
  cache.delete('https://example.test/recipes/chicken/chicken-shawarma.html');
  let status;
  await app.dispatch('message', { data: { type: 'OFFLINE_STATUS' }, ports: [{ postMessage(value) { status = value; } }] });
  assert.equal(status.ready, false);
  app.state.offline = true;
  const response = await app.navigate('unknown/missing.html');
  assert.equal(response.status, 503);
  assert.match(await response.text(), /<base href="https:\/\/example.test\/recipes\/">/);
});

test('external sources, requests outside the app scope and POSTs pass through untouched', async () => {
  const app = worker();
  for (const request of [
    { url: 'https://www.recipetineats.com/beef-tataki/', method: 'GET', mode: 'navigate' },
    { url: 'https://example.test/elsewhere/', method: 'GET', mode: 'navigate' },
    { url: 'https://example.test/recipes/index.html', method: 'POST', mode: 'navigate' }
  ]) assert.equal(await app.dispatch('fetch', { request }), undefined);
});
