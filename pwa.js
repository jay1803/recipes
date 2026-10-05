(function () {
  'use strict';

  // Resolve from this script, so direct recipe visits and subdirectory hosting work.
  var root = new URL('./', document.currentScript.src);
  var panel = document.createElement('section');
  panel.className = 'app-tools';
  panel.setAttribute('aria-label', '离线阅读与安装');
  panel.innerHTML = '<div class="app-tools-row">' +
    '<p class="app-status" role="status" aria-live="polite">正在准备离线菜谱…</p>' +
    '<button class="app-button app-refresh" type="button">刷新菜谱</button>' +
    '<button class="app-button app-retry" type="button" hidden>重试保存</button>' +
    '<button class="app-button app-install" type="button" hidden>安装菜谱合集</button></div>' +
    '<details class="app-help"><summary>离线阅读 · 添加到主屏幕</summary>' +
    '<p>首次联网打开后，会自动保存全部菜谱。看到「已保存」后，即使没有网络，也能打开首页、筛选和阅读每道菜。下次联网打开时会自动检查更新。点击「刷新菜谱」，或在页面顶部下拉并松手，可更新当前页面；联网时会先检查并保存新版，离线时使用已保存的内容。</p>' +
    '<p>iPhone / iPad：在 Safari 的分享菜单中选择「添加到主屏幕」，如有「作为网页 App 打开」选项，请开启。Android / 电脑：使用浏览器菜单中的「安装应用」或「添加到主屏幕」。</p>' +
    '<p>菜谱的原始出处链接需要联网。清除浏览器网站数据会移除离线菜谱，届时需联网重新保存。</p></details>';
  var back = document.querySelector('.back');
  var hero = document.querySelector('.hero');
  (back || hero).insertAdjacentElement('afterend', panel);

  var status = panel.querySelector('.app-status');
  var retry = panel.querySelector('.app-retry');
  var install = panel.querySelector('.app-install');
  var refresh = panel.querySelector('.app-refresh');
  var registration;
  var ready = false;
  var recipeCount = 0;
  var failed = false;
  var checking = false;
  var installPrompt;
  var refreshing = false;
  var refreshError = false;
  var pull = document.createElement('div');
  pull.className = 'app-pull';
  pull.setAttribute('role', 'status');
  pull.setAttribute('aria-live', 'polite');
  pull.hidden = true;
  document.body.appendChild(pull);

  function render() {
    panel.dataset.ready = String(ready);
    refresh.disabled = refreshing || checking;
    refresh.textContent = refreshing ? '正在刷新…' : '刷新菜谱';
    retry.hidden = ready || !failed || !navigator.onLine;
    if (refreshing) {
      status.textContent = navigator.onLine ? '正在检查并保存最新菜谱…' : '正在载入已保存的菜谱…';
    } else if (refreshError) {
      status.textContent = '暂时无法刷新，请稍后重试。' + (ready ? '已保存的菜谱仍可离线阅读。' : '');
    } else if (ready) {
      status.textContent = (navigator.onLine ? '已保存 ' : '当前离线 · 已保存 ') + recipeCount + ' 道菜谱，可离线阅读。';
    } else if (!navigator.onLine) {
      status.textContent = '当前离线 · 请联网完成保存后，再离线阅读全部菜谱。';
    } else if (failed) {
      status.textContent = '菜谱尚未全部保存，请重试。';
    } else {
      status.textContent = '正在保存全部菜谱，请保持页面打开…';
    }
  }

  function waitForActivation(worker) {
    if (!worker || worker.state === 'activated') return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { finish(new Error('Update timed out')); }, 30000);
      function finish(error) {
        clearTimeout(timer);
        worker.removeEventListener('statechange', changed);
        if (error) reject(error);
        else resolve();
      }
      function changed() {
        if (worker.state === 'activated') finish();
        else if (worker.state === 'redundant') finish(new Error('Update failed'));
      }
      worker.addEventListener('statechange', changed);
      changed();
    });
  }

  async function refreshPage() {
    if (refreshing || checking) return;
    refreshing = true;
    refreshError = false;
    pull.hidden = false;
    pull.textContent = '正在刷新…';
    render();
    try {
      if ('serviceWorker' in navigator && window.isSecureContext && navigator.onLine) {
        registration = registration || await navigator.serviceWorker.getRegistration(root.href);
        if (!registration) throw new Error('Offline setup not ready');
        await registration.update();
        // Reload only after the complete new cache is active. A failed update
        // must leave both the current page and the previous offline cache usable.
        await waitForActivation(registration.installing || registration.waiting);
      }
      window.location.reload();
    } catch (error) {
      refreshing = false;
      refreshError = true;
      pull.hidden = true;
      render();
    }
  }

  refresh.addEventListener('click', refreshPage);
  var gesture;
  var pullDistance = 0;
  function resetPull() {
    gesture = null;
    pullDistance = 0;
    if (!refreshing) pull.hidden = true;
  }
  document.addEventListener('touchstart', function (event) {
    resetPull();
    if (event.touches.length !== 1 || window.scrollY > 0 || refreshing || checking ||
        event.target.closest('button, input, select, textarea, summary, [contenteditable]')) return;
    gesture = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  document.addEventListener('touchmove', function (event) {
    if (!gesture) return;
    if (event.touches.length !== 1 || window.scrollY > 0) { resetPull(); return; }
    var dx = event.touches[0].clientX - gesture.x;
    var dy = event.touches[0].clientY - gesture.y;
    if (dy < 0 || Math.abs(dx) > Math.abs(dy)) { resetPull(); return; }
    if (dy < 10) return;
    // Take over only a downward vertical gesture starting at the page top.
    // Normal scrolling, horizontal gestures and pinch zoom remain native.
    if (!event.cancelable) { resetPull(); return; }
    event.preventDefault();
    pullDistance = dy;
    pull.hidden = false;
    pull.textContent = dy >= 100 ? '松手刷新菜谱' : '下拉刷新菜谱';
  }, { passive: false });
  document.addEventListener('touchend', function (event) {
    var shouldRefresh = gesture && pullDistance >= 100 && event.touches.length === 0;
    resetPull();
    if (shouldRefresh) refreshPage();
  }, { passive: true });
  document.addEventListener('touchcancel', resetPull, { passive: true });

  async function checkReady() {
    var worker = navigator.serviceWorker.controller;
    if (!worker) return;
    var channel = new MessageChannel();
    var result = await new Promise(function (resolve) {
      var timer = setTimeout(function () { channel.port1.close(); resolve(null); }, 5000);
      channel.port1.onmessage = function (event) {
        clearTimeout(timer);
        channel.port1.close();
        resolve(event.data);
      };
      worker.postMessage({ type: 'OFFLINE_STATUS' }, [channel.port2]);
    });
    if (result && result.type === 'OFFLINE_STATUS') {
      ready = result.ready;
      recipeCount = result.recipeCount;
      failed = !ready;
    } else {
      ready = false;
      failed = true;
    }
    render();
  }

  function watchWorker(worker) {
    if (!worker) return;
    worker.addEventListener('statechange', function () {
      if (worker.state === 'redundant') {
        failed = true;
        render();
      }
      if (worker.state === 'activated') checkReady();
    });
  }

  async function prepare() {
    if (checking) return;
    checking = true;
    failed = false;
    render();
    try {
      // Existing offline data remains useful even if registration/update cannot
      // reach the server (navigator.onLine can still be true without internet).
      await checkReady();
      registration = await navigator.serviceWorker.register(new URL('sw.js', root), {
        scope: root.href,
        updateViaCache: 'none'
      });
      registration.addEventListener('updatefound', function () { watchWorker(registration.installing); });
      watchWorker(registration.installing);
      await checkReady();
      // An installed worker with evicted resources needs to be installed again.
      // Keep its registration until a fresh worker succeeds, preserving any usable cache.
      if (failed && navigator.onLine) {
        await navigator.serviceWorker.register(new URL('sw.js?repair=' + Date.now(), root), {
          scope: root.href, updateViaCache: 'none'
        });
      } else if (navigator.onLine) {
        await registration.update();
      }
    } catch (error) {
      failed = true;
      render();
    } finally {
      checking = false;
      render();
    }
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installPrompt = event;
    install.hidden = false;
  });
  install.addEventListener('click', async function () {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    install.hidden = true;
  });
  window.addEventListener('appinstalled', function () {
    installPrompt = null;
    install.hidden = true;
  });

  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = '离线保存需要支持此功能的浏览器，并通过 HTTPS 打开网站（本地预览可用 localhost）。';
    return;
  }
  navigator.serviceWorker.addEventListener('controllerchange', checkReady);
  window.addEventListener('offline', render);
  window.addEventListener('online', function () { render(); prepare(); });
  window.addEventListener('pageshow', checkReady);
  retry.addEventListener('click', prepare);
  prepare();
})();
