const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const methods = JSON.parse(fs.readFileSync(path.join(__dirname, '../techniques/steps.json'), 'utf8'));

const root = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', ...fs.readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
  .flatMap((entry) => fs.readdirSync(path.join(root, entry.name))
    .filter((file) => file.endsWith('.html')).map((file) => entry.name + '/' + file))];

test('local reading links resolve to existing pages and anchors, including subdirectory hosting', () => {
  for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      const url = new URL(href, 'https://example.test/recipes/' + file);
      if (url.origin !== 'https://example.test' || !url.pathname.endsWith('.html')) continue;
      assert.ok(url.pathname.startsWith('/recipes/'), file + ': ' + href);
      const target = path.join(root, decodeURIComponent(url.pathname.slice('/recipes/'.length)));
      assert.ok(fs.existsSync(target), file + ': ' + href);
      if (url.hash) {
        const anchor = decodeURIComponent(url.hash.slice(1));
        const ids = [...fs.readFileSync(target, 'utf8').matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
        assert.ok(ids.includes(anchor), file + ': ' + href);
      }
    }
  }
});

test('every technique is reachable from the shared index and refers back to its source recipes', () => {
  const index = fs.readFileSync(path.join(root, 'techniques/index.html'), 'utf8');
  const recipes = new Set([...fs.readFileSync(path.join(root, 'index.html'), 'utf8')
    .matchAll(/class="recipe-card" href="([^"]+)"/g)].map((m) => m[1]));
  for (const file of htmlFiles.filter((f) => f.startsWith('techniques/') && f !== 'techniques/index.html')) {
    assert.ok(index.includes('href="' + path.basename(file) + '"'), file);
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(!html.includes('<style>'), file);
    assert.match(html, /href="\.\.\/styles.css"/);
    const sources = [...html.matchAll(/href="\.\.\/([^"]+\.html)"/g)].map((m) => m[1]).filter((f) => recipes.has(f));
    assert.ok(sources.length > 0, file + ' requires source recipes');
    for (const source of new Set(sources)) {
      const recipe = fs.readFileSync(path.join(root, source), 'utf8');
      const used = [...recipe.matchAll(/<!-- preparation: ([^\n]+) -->/g)]
        .map((m) => methods[JSON.parse(m[1]).method].reference.split('#')[0]);
      assert.ok(used.includes(path.basename(file)), source + ' must use its shared method');
    }
  }
});

test('recipes contain complete static steps without linking readers to another method page', () => {
  const recipes = htmlFiles.filter((file) => file !== 'index.html' && !file.startsWith('techniques/'));
  for (const file of recipes) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(html, /href="[^\"]*techniques\//, file);
    for (const [, generated] of html.matchAll(/<!-- preparation: [^\n]+ -->\n([\s\S]*?)<!-- \/preparation -->/g)) {
      assert.match(generated, /<li>[^<]|<li><b>/, file);
      assert.doesNotMatch(generated, /<a\s|\{\w+\}/, file);
    }
  }
});
