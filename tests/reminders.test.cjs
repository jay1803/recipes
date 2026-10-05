const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../reminders.js'), 'utf8');
function control() {
  return { href: '', textContent: '', listeners: {}, addEventListener(type, listener) { this.listeners[type] = listener; } };
}
function app(groups, clipboard) {
  const controls = Object.fromEntries(['add', 'install', 'copy', 'status'].map(key => [key, control()]));
  const panel = { setAttribute() {}, querySelector(selector) { return controls[selector.replace('.reminder-', '')]; } };
  const ingredients = groups && {
    prepend() {},
    querySelectorAll() {
      return groups.map(([group, rows]) => ({
        querySelector() { return { childNodes: [
          { nodeType: 1, classList: { contains: () => true }, textContent: '🍗' },
          { nodeType: 3, textContent: group }
        ] }; },
        querySelectorAll() { return rows.map(([name, quantity]) => ({
          querySelector(selector) {
            const value = selector === '.name' ? name : quantity;
            return value == null ? null : { textContent: value };
          }
        })); }
      }));
    }
  };
  const document = {
    title: '鸡肉 & 香菇 + 米饭',
    currentScript: { src: 'https://example.test/recipes/reminders.js' },
    querySelector() { return ingredients; }, createElement() { return panel; }
  };
  vm.runInNewContext(source, {
    document, navigator: { clipboard }, URL,
    window: { location: { href: 'https://example.test/recipes/chicken/example.html?from=home#tips' } }
  });
  return { ...controls, panel };
}

test('handoff preserves Unicode, quantities, optional notes and repeated ingredients under their groups', () => {
  const page = app([
    [' 鸡肉 ', [['鸡腿肉  去骨\n切块', '900 g'], ['盐 + 黑胡椒', '适量']]],
    ['酱汁', [['盐 + 黑胡椒', '适量'], ['糖 & 醋', null], ['', 'ignore']]]
  ]);
  const link = new URL(page.add.href);
  assert.equal(link.protocol, 'shortcuts:');
  assert.equal(link.hostname, 'run-shortcut');
  assert.equal(link.searchParams.get('name'), '菜谱食材加入提醒事项');
  assert.equal(link.searchParams.get('input'), 'text');
  assert.ok(!page.add.href.includes('+'), 'spaces use %20 and literal plus signs use %2B');
  assert.deepEqual(JSON.parse(link.searchParams.get('text')), {
    title: '鸡肉 & 香菇 + 米饭', url: 'https://example.test/recipes/chicken/example.html',
    ingredients: ['鸡肉：鸡腿肉 去骨 切块 · 900 g', '鸡肉：盐 + 黑胡椒 · 适量', '酱汁：盐 + 黑胡椒 · 适量', '酱汁：糖 & 醋']
  });
  assert.equal(page.install.href, 'https://example.test/recipes/shortcuts/recipe-ingredients.shortcut');
  assert.match(page.panel.innerHTML, /download="菜谱食材加入提醒事项.shortcut"/);
});

test('handoff reports opening Shortcuts without claiming a reminder write succeeded', () => {
  const page = app([['食材', [['米', '100 g']]]]);
  page.add.listeners.click({ preventDefault() { assert.fail('valid handoff blocked'); } });
  assert.match(page.status.textContent, /正在打开快捷指令/);
  assert.doesNotMatch(page.status.textContent, /已导入|已加入/);
});

test('no ingredients cancels navigation and the index has no reminder UI', () => {
  const page = app([]);
  let prevented = false;
  page.add.listeners.click({ preventDefault() { prevented = true; } });
  assert.ok(prevented);
  assert.match(page.status.textContent, /没有找到/);
  assert.equal(app(null).panel.innerHTML, undefined);
});

test('copy fallback contains the recipe, source and every ingredient and reports clipboard failures', async () => {
  let copied;
  const page = app([['食材', [['米', '100 g']]]], { async writeText(value) { copied = value; } });
  await page.copy.listeners.click();
  assert.equal(copied, '鸡肉 & 香菇 + 米饭\nhttps://example.test/recipes/chicken/example.html\n\n食材：米 · 100 g');
  assert.equal(page.status.textContent, '已复制食材清单。');
  for (const clipboard of [undefined, { async writeText() { throw new Error('Denied'); } }]) {
    const failure = app([], clipboard);
    await failure.copy.listeners.click();
    assert.match(failure.status.textContent, /无法自动复制/);
  }
});
