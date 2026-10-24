import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { islands } from '../src/content.js';

test('the treasure map exposes seven unique Korean landmarks', () => {
  const expectedIds = ['profile', 'personal', 'team', 'external', 'study', 'materials', 'work'];
  const expectedLandmarks = ['profile', 'personal', 'team', 'external', 'study', 'materials', 'work'];
  const maps = expectedIds.map((id) => islands.find((island) => island.id === id)?.map);

  assert.equal(maps.length, 7);
  assert.ok(maps.every(Boolean));
  assert.deepEqual(maps.map((map) => map.landmark), expectedLandmarks);
  assert.equal(new Set(maps.map((map) => `${map.x}:${map.y}`)).size, 7);
  assert.deepEqual(maps.map((map) => map.label), ['프로필', '개인 프로젝트', '팀 프로젝트', '대외활동', '스터디', '자료', '작업']);
  assert.ok(maps.every((map) => map.x >= 8 && map.x <= 92 && map.y >= 10 && map.y <= 88));
});

test('the treasure map renderer is an accessible inline SVG composition', () => {
  const source = readFileSync(resolve('src/treasure-map.js'), 'utf8');

  assert.match(source, /export function renderTreasureMap/);
  assert.match(source, /<svg/);
  assert.match(source, /viewBox/);
  assert.match(source, /aria-label/);
  assert.match(source, /treasure-map-route/);
  assert.match(source, /treasure-map-landmark/);
  assert.match(source, /data-island-id/);
  assert.match(source, /work:/);
  assert.match(source, /materials:/);
  assert.match(source, /balloon/);
  assert.match(source, /lighthouse/);
  assert.match(source, /ship/);
});

test('category landmarks use island or ship art as the primary hover target', () => {
  const source = readFileSync(resolve('src/treasure-map.js'), 'utf8');
  const css = readFileSync(resolve('src/styles.css'), 'utf8');

  assert.match(source, /landmark === 'team' \|\| landmark === 'materials'/);
  assert.match(source, /landmark-island/);
  assert.match(source, /landmark-ship/);
  assert.match(source, /treasure-map-landmark__label/);
  assert.match(css, /\.treasure-map-landmark:hover/);
  assert.match(css, /\.treasure-map-landmark__label::before/);
  assert.match(css, /\.treasure-map-landmark__label::after/);
});

test('landmark nameplates attach above the island or ship and flags anchor into the art', () => {
  const source = readFileSync(resolve('src/treasure-map.js'), 'utf8');
  const css = readFileSync(resolve('src/styles.css'), 'utf8');

  assert.match(source, /<span class="treasure-map-landmark__label">[\s\S]*<span class="treasure-map-landmark__art"/);
  assert.match(source, /landmark-flagpole/);
  assert.match(source, /landmark-flag/);
  assert.match(css, /\.treasure-map-landmark__label[^}]*margin-bottom:\s*-\d+px/);
  assert.match(css, /\.treasure-map-landmark__label::before[^}]*bottom:/);
});

test('the treasure map is composed as a dense hand-drawn illustration', () => {
  const source = readFileSync(resolve('src/treasure-map.js'), 'utf8');

  assert.match(source, /treasure-map-illustration/);
  assert.match(source, /treasure-map-cartography/);
  assert.match(source, /treasure-map-island/);
  assert.match(source, /treasure-map-route-label/);
  assert.match(source, /hot-air-balloon/);
  assert.match(source, /mountain-range/);
  assert.match(source, /palm-grove/);
  assert.match(source, /treasure-map-compass/);
});
