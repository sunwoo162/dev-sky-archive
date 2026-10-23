import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'index.html'), 'utf8');
const css = readFileSync(join(here, '..', 'src', 'styles.css'), 'utf8');
const app = readFileSync(join(here, '..', 'src', 'app.js'), 'utf8');

test('the playable world exposes live interaction feedback to assistive technology', () => {
  assert.match(html, /id="interaction-text"[^>]*aria-live="polite"/);
  assert.match(html, /id="island-count"[^>]*aria-live="polite"/);
});

test('the archive disables decorative motion when the user prefers reduced motion', () => {
  assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
  assert.match(app, /matchMedia\(['"]\(prefers-reduced-motion: reduce\)['"]\)/);
  assert.match(app, /prefersReducedMotion/);
});

test('keyboard controls preserve native activation for focused controls', () => {
  assert.match(app, /closest\(['"]button, a, input, select, textarea, \[role="button"\]['"]\)/);
  assert.match(app, /if \(key === ['"] ['"] && isInteractiveTarget\) return/);
});

test('archive and exhibit navigation manage focus', () => {
  assert.match(app, /archiveModal.*querySelectorAll/s);
  assert.match(app, /lastProjectFocusProjectId/);
  assert.match(app, /projectFocusTarget\?\.focus\(\)/);
});
