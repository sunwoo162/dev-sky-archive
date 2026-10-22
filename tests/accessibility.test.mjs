import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'index.html'), 'utf8');
const css = readFileSync(join(here, '..', 'src', 'styles.css'), 'utf8');

test('the playable world exposes live interaction feedback to assistive technology', () => {
  assert.match(html, /id="interaction-text"[^>]*aria-live="polite"/);
  assert.match(html, /id="island-count"[^>]*aria-live="polite"/);
});

test('the archive disables decorative motion when the user prefers reduced motion', () => {
  assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
});
