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
