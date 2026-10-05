"""Expand shared preparation markers into committed, readable recipe HTML."""
import argparse
import html
import json
import re
from pathlib import Path
from string import Formatter

ROOT = Path(__file__).resolve().parent.parent
BLOCK = re.compile(r'(?P<indent>^[ \t]*)<!-- preparation: (?P<spec>[^\n]+) -->\n'
                   r'.*?^[ \t]*<!-- /preparation -->', re.MULTILINE | re.DOTALL)


def expand(text, methods):
    def render(match):
        spec = json.loads(match['spec'])
        method = methods[spec['method']]
        params = spec.get('params', {})
        expected = {field for step in method['steps']
                    for _, field, _, _ in Formatter().parse(step) if field is not None}
        if set(params) != expected or not all(isinstance(v, str) for v in params.values()):
            raise ValueError(f"{spec['method']}: expected text parameters {sorted(expected)}")
        escaped = {key: html.escape(value) for key, value in params.items()}
        lines = [f"{match['indent']}<li>{step.format(**escaped)}</li>" for step in method['steps']]
        return (f"{match['indent']}<!-- preparation: {match['spec']} -->\n"
                + '\n'.join(lines) + f"\n{match['indent']}<!-- /preparation -->")
    if text.count('<!-- preparation:') != len(list(BLOCK.finditer(text))):
        raise ValueError('Unclosed or invalid preparation marker')
    return BLOCK.sub(render, text)


def sync(check=False, root=ROOT):
    methods = json.loads((root / 'techniques/steps.json').read_text())
    updates = []
    for file in sorted(root.glob('*/*.html')):
        if file.parent.name == 'techniques':
            continue
        text = file.read_text()
        try:
            output = expand(text, methods)
        except (ValueError, KeyError) as error:
            raise ValueError(f'{file.relative_to(root)}: {error}') from error
        if output != text:
            updates.append((file, output))
    if check and updates:
        raise ValueError('Shared preparations are stale. Run: python3 scripts/preparations.py')
    for file, output in updates:
        file.write_text(output)
    return len(updates)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    try:
        changed = sync(check=args.check)
    except ValueError as error:
        parser.exit(1, str(error) + '\n')
    print('Shared preparations are current.' if args.check else f'Updated preparations in {changed} recipes.')


if __name__ == '__main__':
    main()
