const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../pwa.js'), 'utf8');
const tick = () => new Promise((resolve) => setImmediate(resolve));

function element() {
  return {
    dataset: {}, hidden: false, disabled: false, textContent: '', listeners: {},
    setAttribute() {},
    addEventListener(type, listener) { this.listeners[type] = listener; },
    closest() { return null; }
  };
}

async function app() {
  const controls = Object.fromEntries(['status', 'retry', 'install', 'refresh'].map((key) => [key, element()]));
  const panel = element();
  panel.querySelector = (selector) => controls[selector.replace('.app-', '')];
  const pull = element();
  const document = element();
  document.currentScript = { src: 'https://example.test/recipes/pwa.js' };
  document.createElement = (tag) => tag === 'section' ? panel : pull;
  document.querySelector = () => ({ insertAdjacentElement() {} });
  document.body = { appendChild() {} };
  const state = { reloads: 0, updates: 0 };
  const registration = new EventTarget();
  registration.update = async () => { state.updates++; };
  const serviceWorker = new EventTarget();
  serviceWorker.controller = {
    postMessage(message, ports) { ports[0].postMessage({ type: 'OFFLINE_STATUS', ready: true, recipeCount: 48 }); }
  };
  serviceWorker.register = async () => registration;
  serviceWorker.getRegistration = async () => registration;
  const navigator = { serviceWorker, onLine: true };
  const window = element();
  window.isSecureContext = true;
  window.scrollY = 0;
  window.location = { reload() { state.reloads++; } };
  class Channel {
    constructor() {
      this.port1 = { close() {} };
      this.port2 = { postMessage: (data) => this.port1.onmessage({ data }) };
    }
  }
  vm.runInNewContext(source, { document, navigator, window, URL, MessageChannel: Channel, setTimeout, clearTimeout });
  await tick();
  assert.equal(controls.refresh.disabled, false);
  return { controls, pull, document, window, navigator, registration, state,
    click: () => controls.refresh.listeners.click(),
    touch(type, x, y, options = {}) {
      let prevented = false;
      const event = {
        target: element(), cancelable: true,
        touches: type === 'touchend' || type === 'touchcancel' ? [] : [{ clientX: x, clientY: y }],
        preventDefault() { prevented = true; }, ...options
      };
      document.listeners[type](event);
      return prevented;
    }
  };
}

test('manual refresh waits for the new complete worker to activate and prevents duplicate requests', async () => {
  const page = await app();
  const worker = new EventTarget();
  worker.state = 'installing';
  page.registration.update = async () => { page.state.updates++; page.registration.installing = worker; };
  const refresh = page.click();
  await tick();
  assert.equal(page.state.reloads, 0);
  assert.equal(page.controls.refresh.disabled, true);
  assert.equal(page.pull.textContent, '正在刷新…');
  const updates = page.state.updates;
  await page.click();
  assert.equal(page.state.updates, updates);
  worker.state = 'activated';
  worker.dispatchEvent(new Event('statechange'));
  await refresh;
  assert.equal(page.state.reloads, 1);
});

test('failed check or failed install retains the current page and allows another refresh', async () => {
  for (const failure of ['check', 'install']) {
    const page = await app();
    const worker = new EventTarget();
    worker.state = 'installing';
    page.registration.update = async () => {
      if (failure === 'check') throw new Error('No internet');
      page.registration.installing = worker;
    };
    const refresh = page.click();
    await tick();
    worker.state = 'redundant';
    worker.dispatchEvent(new Event('statechange'));
    await refresh;
    assert.equal(page.state.reloads, 0);
    assert.equal(page.controls.refresh.disabled, false);
    assert.equal(page.pull.hidden, true);
    assert.match(page.controls.status.textContent, /暂时无法刷新.*已保存的菜谱仍可离线阅读/);
    page.registration.installing = null;
    page.registration.update = async () => {};
    await page.click();
    assert.equal(page.state.reloads, 1);
  }
});

test('offline refresh reloads saved content without trying a network update', async () => {
  const page = await app();
  page.navigator.onLine = false;
  const updates = page.state.updates;
  await page.click();
  assert.equal(page.state.updates, updates);
  assert.equal(page.state.reloads, 1);
});

test('pull at the page top refreshes only after crossing the threshold and releasing', async () => {
  const page = await app();
  page.navigator.onLine = false;
  page.touch('touchstart', 20, 20);
  assert.equal(page.touch('touchmove', 20, 70), true);
  assert.equal(page.pull.textContent, '下拉刷新菜谱');
  page.touch('touchend');
  assert.equal(page.state.reloads, 0);
  page.touch('touchstart', 20, 20);
  page.touch('touchmove', 20, 140);
  assert.equal(page.pull.textContent, '松手刷新菜谱');
  assert.equal(page.state.reloads, 0);
  page.touch('touchend');
  assert.equal(page.state.reloads, 1);
});

test('scrolling, sideways gestures, controls, multiple touches and cancellations do not refresh', async () => {
  for (const kind of ['scroll', 'horizontal', 'up', 'control', 'multitouch', 'cancel', 'uncancelable']) {
    const page = await app();
    if (kind === 'scroll') page.window.scrollY = 100;
    const target = element();
    if (kind === 'control') target.closest = () => ({});
    page.touch('touchstart', 20, 20, { target });
    const options = kind === 'multitouch' ? { touches: [{ clientX: 20, clientY: 200 }, { clientX: 50, clientY: 200 }] }
      : kind === 'uncancelable' ? { cancelable: false } : {};
    page.touch('touchmove', kind === 'horizontal' ? 300 : 20, kind === 'up' ? 0 : 150, options);
    if (kind === 'cancel') page.touch('touchcancel');
    page.touch('touchend');
    assert.equal(page.state.reloads, 0, kind);
    assert.equal(page.pull.hidden, true, kind);
  }
});
