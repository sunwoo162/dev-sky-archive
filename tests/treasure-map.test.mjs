import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { islands } from '../src/content.js';

test('the treasure map exposes seven unique Korean landmarks', () => {
  const expectedIds = ['profile', 'personal', 'team', 'external', 'study', 'materials', 'work'];
  const expectedLandmarks = ['profile', 'personal', 'team', 'external', 'study', 'materials', 'work'];
  const expectedNaturalTargets = [
    { x: 50, y: 62, target: 'island' },
    { x: 22, y: 60, target: 'settlement' },
    { x: 63, y: 78, target: 'ship' },
    { x: 15, y: 24, target: 'castle' },
    { x: 68, y: 24, target: 'castle' },
    { x: 69, y: 60, target: 'ship' },
    { x: 45, y: 24, target: 'castle' },
  ];
  const maps = expectedIds.map((id) => islands.find((island) => island.id === id)?.map);

  assert.equal(maps.length, 7);
  assert.ok(maps.every(Boolean));
  assert.deepEqual(maps.map((map) => map.landmark), expectedLandmarks);
  assert.equal(new Set(maps.map((map) => `${map.x}:${map.y}`)).size, 7);
  assert.deepEqual(maps.map((map) => map.label), ['프로필', '개인 프로젝트', '팀 프로젝트', '대외활동', '스터디', '자료', '작업']);
  assert.deepEqual(maps.map(({ x, y, target }) => ({ x, y, target })), expectedNaturalTargets);
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
  assert.match(source, /treasure-map-raster/);
  assert.match(source, /assets\/maps\/treasure-map-etched\.png/);
});

test('category landmarks use the natural raster map as the primary hover target', () => {
  const source = readFileSync(resolve('src/treasure-map.js'), 'utf8');
  const css = readFileSync(resolve('src/styles.css'), 'utf8');

  assert.match(source, /treasure-map-raster/);
  assert.match(source, /treasure-map-landmark__label/);
  assert.doesNotMatch(source, /function landmarkArt/);
  assert.match(css, /\.treasure-map-landmark:hover/);
  assert.match(css, /\.treasure-map-landmark__label[^}]*mix-blend-mode:\s*multiply/);
});

test('landmark nameplates attach to natural map locations without synthetic islands', () => {
  const source = readFileSync(resolve('src/treasure-map.js'), 'utf8');
  const css = readFileSync(resolve('src/styles.css'), 'utf8');

  assert.match(source, /<span class="treasure-map-landmark__label">/);
  assert.match(source, /data-map-target=/);
  assert.doesNotMatch(source, /landmark-anchor/);
  assert.doesNotMatch(source, /landmark-flagpole/);
  assert.match(css, /\.treasure-map-landmark__label[^}]*top:\s*0/);
  assert.match(css, /\.treasure-map-landmark__label[^}]*opacity:\s*\.9/);
});

test('natural map hover zones stay centered on the illustrated subject', () => {
  const css = readFileSync(resolve('src/styles.css'), 'utf8');

  assert.match(css, /\.treasure-map-landmark--ship[^}]*width:/);
  assert.match(css, /\.treasure-map-landmark--castle[^}]*width:/);
  assert.match(css, /\.treasure-map-landmark--island[^}]*width:/);
  assert.match(css, /\.treasure-map-landmark::before[^}]*opacity:\s*0/);
  assert.match(css, /\.treasure-map-landmark:hover::before[^}]*opacity:/);
  assert.match(css, /\.treasure-map-landmarks[^}]*left:\s*50%/);
  assert.match(css, /\.treasure-map-landmarks[^}]*width:\s*max\(100%,\s*calc\(100dvh \* 1\.75\)\)/);
  assert.match(css, /\.treasure-map-landmarks[^}]*height:\s*max\(100%,\s*calc\(100dvw \/ 1\.75\)\)/);
  assert.doesNotMatch(css, /\.treasure-map-landmark:hover, \.treasure-map-landmark:focus-visible[^}]*scale\(/);
});

test('landmark labels use the same etched sepia language as the map background', () => {
  const source = readFileSync(resolve('src/treasure-map.js'), 'utf8');
  const css = readFileSync(resolve('src/styles.css'), 'utf8');

  assert.match(css, /\.treasure-map-landmark__label[^}]*background:\s*rgba\(/);
  assert.match(css, /\.treasure-map-landmark__label[^}]*box-shadow:\s*none/);
  assert.match(css, /\.treasure-map-landmark__label[^}]*mix-blend-mode:\s*multiply/);
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
