const { test } = require('node:test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

function python(code) {
  execFileSync('python3', ['-c', 'import sys\nsys.path.insert(0, "scripts")\n' + code], {
    cwd: path.resolve(__dirname, '..'), stdio: 'pipe'
  });
}

test('shared edits propagate into each recipe while preserving local parameters and escaped text', () => {
  python(`from preparations import expand
methods = {'mix': {'steps': ['抓匀<b>{flavour}</b>。']}}
def recipe(flavour):
    import json
    spec = json.dumps({'method':'mix','params':{'flavour':flavour}})
    return '<!-- preparation: ' + spec + ' -->\\n<li>旧内容</li>\\n<!-- /preparation -->'
a, b = recipe('生抽'), recipe('盐 & <胡椒>')
methods['mix']['steps'][0] = '先切片，再抓匀<b>{flavour}</b>。'
assert '先切片，再抓匀<b>生抽</b>' in expand(a, methods)
assert '盐 &amp; &lt;胡椒&gt;' in expand(b, methods)
assert expand(expand(a, methods), methods) == expand(a, methods)
`);
});

test('invalid methods, missing parameters and malformed markers fail instead of silently producing empty steps', () => {
  python(`from preparations import expand
methods = {'mix': {'steps': ['抓匀{flavour}。']}}
for text in [
    '<!-- preparation: {"method":"missing"} -->\\n<li>原内容</li>\\n<!-- /preparation -->',
    '<!-- preparation: {"method":"mix"} -->\\n<li>原内容</li>\\n<!-- /preparation -->',
    '<!-- preparation: {"method":"mix","params":{"flavour":"盐","extra":"油"}} -->\\n<li>原内容</li>\\n<!-- /preparation -->',
    '<!-- preparation: {"method":"mix"} -->\\n<li>原内容</li>'
]:
    try:
        expand(text, methods)
    except (ValueError, KeyError):
        pass
    else:
        raise AssertionError('invalid preparation was accepted')
`);
});

test('stale check reports drift without writing; synchronization creates complete static HTML', () => {
  python(`import json, tempfile
from pathlib import Path
from preparations import sync
with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    (root/'techniques').mkdir()
    (root/'beef').mkdir()
    (root/'techniques/steps.json').write_text(json.dumps({'mix': {'steps':['完整步骤。']}}))
    file = root/'beef/example.html'
    original = '<!-- preparation: {"method":"mix"} -->\\n<li>旧内容</li>\\n<!-- /preparation -->'
    file.write_text(original)
    try:
        sync(check=True, root=root)
    except ValueError:
        pass
    else:
        raise AssertionError('stale check passed')
    assert file.read_text() == original
    assert sync(root=root) == 1
    assert '<li>完整步骤。</li>' in file.read_text()
    assert sync(check=True, root=root) == 0
`);
});
