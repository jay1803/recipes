#!/usr/bin/env python3
"""Generate the committed offline inventory/version; hosting needs no build step."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def generate():
    recipes = sorted(path.relative_to(ROOT).as_posix() for path in ROOT.glob('*/*.html')
                     if path.parent.name != 'techniques')
    techniques = sorted(path.relative_to(ROOT).as_posix() for path in (ROOT / 'techniques').glob('*.html'))
    files = ['index.html', 'styles.css', 'pwa.css', 'pwa.js', 'reminders.js', 'manifest.webmanifest', 'offline.html']
    files += ['shortcuts/recipe-ingredients.shortcut']
    files += sorted(path.relative_to(ROOT).as_posix() for path in (ROOT / 'icons').glob('*.png'))
    files += recipes + techniques
    template = (ROOT / 'scripts/sw-template.js').read_text()
    digest = hashlib.sha256(template.encode())
    for name in files:
        digest.update(name.encode() + b'\0' + (ROOT / name).read_bytes() + b'\0')
    return template.replace('__VERSION__', digest.hexdigest()[:16]).replace(
        '__RECIPE_COUNT__', str(len(recipes))
    ).replace('__FILES__', json.dumps(files, ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if sw.js needs regeneration')
    args = parser.parse_args()
    output = generate()
    target = ROOT / 'sw.js'
    if args.check:
        if not target.exists() or target.read_text() != output:
            parser.exit(1, 'Offline inventory is stale. Run: python3 scripts/update-offline.py\n')
        print('Offline inventory and content version are up to date.')
    else:
        target.write_text(output)
        print('Updated sw.js with all recipes and a content-derived cache version.')


if __name__ == '__main__':
    main()
