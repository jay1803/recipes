(function () {
  'use strict';

  var ingredients = document.querySelector('aside.ingredients');
  if (!ingredients) return;
  var root = new URL('./', document.currentScript.src);
  var shortcutName = '菜谱食材加入提醒事项';

  function clean(text) { return text.replace(/\s+/g, ' ').trim(); }

  function collect() {
    var items = [];
    ingredients.querySelectorAll('.ing-block').forEach(function (block) {
      block.querySelectorAll('.ing-list > li').forEach(function (row) {
        var name = row.querySelector('.name');
        var quantity = row.querySelector('.qty');
        if (!name) return;
        var label = name.cloneNode(true);
        label.querySelectorAll('.opt').forEach(function (note) { note.remove(); });
        var ingredientName = clean(label.textContent);
        if (!ingredientName) return;
        var amount = quantity ? clean(quantity.textContent) : '';
        if (!amount || /未知|未标|未确认|不详|不明/.test(amount) || /^(可选|按需)$/.test(amount)) amount = '适量';
        items.push(ingredientName + ' x ' + amount);
      });
    });
    return { title: clean(document.title), url: window.location.href.split(/[?#]/)[0], ingredients: items };
  }

  var panel = document.createElement('section');
  panel.className = 'reminder-tools';
  panel.setAttribute('aria-label', '食材购物清单');
  panel.innerHTML = '<a class="reminder-add" href="#">加入 Apple 提醒事项</a>' +
    '<p>以菜名创建任务，每项食材作为子任务。再次导入会新建一组。</p>' +
    '<details><summary>首次使用 · 安装快捷指令</summary>' +
    '<p>需要 iPhone、iPad 或 Mac 的「快捷指令」和「提醒事项」。' +
    '<a class="reminder-install" download="' + shortcutName + '.shortcut">下载快捷指令</a>，打开文件并添加，保留名称「' + shortcutName + '」。' +
    '在快捷指令的第一个「添加新提醒事项」动作中选好支持子任务的 iCloud 清单，首次运行时允许访问提醒事项。</p>' +
    '<p>安装后，点上方按钮即可导入全部食材和用量。是否成功以快捷指令的提示及提醒事项中的结果为准。</p>' +
    '</details><button class="reminder-copy" type="button">复制食材清单</button>' +
    '<p class="reminder-status" role="status" aria-live="polite"></p>';
  ingredients.prepend(panel);
  var add = panel.querySelector('.reminder-add');
  var status = panel.querySelector('.reminder-status');
  panel.querySelector('.reminder-install').href = new URL('shortcuts/recipe-ingredients.shortcut', root).href;

  function updateLink() {
    var data = collect();
    // Apple's URL scheme expects percent-encoded text (spaces must be %20,
    // not form-urlencoded '+', which native URL parsers may keep literally).
    add.href = 'shortcuts://run-shortcut?name=' + encodeURIComponent(shortcutName) +
      '&input=text&text=' + encodeURIComponent(JSON.stringify(data));
    return data;
  }
  updateLink();
  add.addEventListener('click', function (event) {
    var data = updateLink();
    if (!data.ingredients.length) {
      event.preventDefault();
      status.textContent = '没有找到可导入的食材。';
      return;
    }
    // Opening the URL only hands off to Shortcuts; it is not proof of a write.
    status.textContent = '正在打开快捷指令。若未导入，请先展开「首次使用」完成安装。';
  });
  panel.querySelector('.reminder-copy').addEventListener('click', async function () {
    var data = collect();
    try {
      await navigator.clipboard.writeText([data.title, data.url, ''].concat(data.ingredients).join('\n'));
      status.textContent = '已复制食材清单。';
    } catch (error) {
      status.textContent = '无法自动复制，请直接选择页面中的食材文字复制。';
    }
  });
})();
