import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), 'utf8');
}

test('sky landing screen keeps Korean title lines intact and exposes clear map controls', async () => {
  const html = await read('index.html');
  const css = await read('src/styles.css');

  assert.match(html, /class="sky-title-line"/g);
  assert.match(css, /\.sky-title-line\s*\{/);
  assert.match(css, /\.sky-title-line[^}]*white-space:\s*nowrap/);
  assert.match(css, /\.sky-title-line[^}]*overflow-wrap:\s*normal/);
  assert.match(css, /\.sky-map-label[^}]*color:\s*rgba\(40,64,82/);
  assert.match(css, /\.archive-index-trigger:focus-visible/);
  assert.match(css, /\.island-button:focus-visible/);
  assert.match(css, /\.app-shell\s*\{[^}]*overflow-x:\s*hidden/);
  assert.doesNotMatch(css, /\.app-shell\s*\{[^}]*overflow:\s*hidden/);
});

test('static release workflows verify the app and deploy the archive to Pages', async () => {
  const ci = await read('.github/workflows/ci.yml');
  const pages = await read('.github/workflows/deploy-pages.yml');
  const readme = await read('README.md');

  assert.match(ci, /node --test tests\/\*\.mjs/);
  assert.match(ci, /node --check src\/app\.js/);
  assert.match(pages, /actions\/deploy-pages/);
  assert.match(pages, /actions\/upload-pages-artifact/);
  assert.match(pages, /branches:\s*\[main\]/);
  assert.match(readme, /GitHub Pages/i);
  assert.match(readme, /deploy-pages/i);
});
