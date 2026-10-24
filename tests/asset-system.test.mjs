import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { assetCatalog, assetIds, assetUrl } from '../src/asset-catalog.js';

const root = path.resolve(import.meta.dirname, '..');

test('the pixel asset catalog is grouped by visual responsibility', () => {
  const categories = new Set(Object.values(assetCatalog).map((entry) => entry.category));

  assert.deepEqual(categories, new Set(['tiles', 'characters', 'props', 'ui', 'projects']));
  assert.ok(assetIds.length >= 12);
});

test('every catalog entry points to an existing local SVG asset', () => {
  for (const [id, entry] of Object.entries(assetCatalog)) {
    assert.match(entry.path, /^\.\.\/assets\/.+\.svg$/);
    assert.ok(entry.alt, `${id} needs an accessible alt label`);
    assert.ok(existsSync(path.join(root, 'src', entry.path)), `${id} points to a missing asset`);
  }
});

test('assetUrl returns a safe local fallback for unknown IDs', () => {
  assert.equal(assetUrl('does-not-exist'), assetCatalog['pixel-frame'].path);
});

test('runtime rendering imports the catalog and uses asset-backed world hooks', () => {
  const app = readFileSync(path.join(root, 'src', 'app.js'), 'utf8');
  const content = readFileSync(path.join(root, 'src', 'content.js'), 'utf8');
  const treasureMap = readFileSync(path.join(root, 'src', 'treasure-map.js'), 'utf8');
  const html = readFileSync(path.join(root, 'index.html'), 'utf8');
  const preview = readFileSync(path.join(root, 'asset-preview.html'), 'utf8');

  assert.match(app, /from ['"]\.\/asset-catalog\.js['"]/);
  assert.match(app, /from ['"]\.\/treasure-map\.js(?:\?[^'"]+)?['"]/);
  assert.match(app, /renderTreasureMap\(/);
  assert.doesNotMatch(app, /sky-3d/);
  assert.match(app, /assetUrl\(/);
  assert.match(content, /map:\s*\{/);
  assert.match(content, /landmark:/);
  assert.match(html, /asset-palette|data-asset-id/);
  assert.match(html, /id="treasure-map"/);
  assert.doesNotMatch(html, /sky-3d-canvas/);
  assert.match(treasureMap, /treasure-map-svg/);
  assert.match(treasureMap, /treasure-map-landmark/);
  assert.match(preview, /DESIGN ASSET BREAKDOWN/);
  assert.match(preview, /ASSET LIBRARY/);
});

test('the landing screen includes the high-fidelity etched map asset', () => {
  const mapAsset = path.join(root, 'assets', 'maps', 'treasure-map-etched.png');
  const source = readFileSync(path.join(root, 'src', 'treasure-map.js'), 'utf8');

  assert.ok(existsSync(mapAsset));
  assert.ok(statSync(mapAsset).size > 100_000);
  assert.match(source, /assets\/maps\/treasure-map-etched\.png/);
});
