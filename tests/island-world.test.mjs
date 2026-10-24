import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HARBOR_START,
  MUSEUM_DOOR,
  WORLD_SIZE,
  createMuseumLayout,
  createIslandWorld,
  findNearestExhibit,
  getCamera,
  isAtMuseumDoor,
} from '../src/island-world.js';

const island = {
  id: 'personal',
  title: '개인 프로젝트',
  color: '#ff9b71',
  projects: [
    { id: 'one', title: 'One' },
    { id: 'two', title: 'Two' },
    { id: 'three', title: 'Three' },
  ],
};

test('island world begins at the harbor and places the museum north of it', () => {
  const world = createIslandWorld(island);

  assert.deepEqual(world.start, HARBOR_START);
  assert.equal(world.museum.door.x, MUSEUM_DOOR.x);
  assert.ok(world.museum.door.y < HARBOR_START.y);
  assert.equal(world.projects.length, island.projects.length);
  assert.equal(WORLD_SIZE.width > WORLD_SIZE.height, true);
});

test('museum layout turns every project into a walkable exhibit station', () => {
  const layout = createMuseumLayout(island.projects);

  assert.equal(layout.length, island.projects.length);
  assert.deepEqual(layout.map((item) => item.id), ['one', 'two', 'three']);
  assert.ok(layout.every((item) => item.x > 0 && item.y > 0));
  assert.notEqual(layout[0].x, layout[1].x);
});

test('nearest exhibit is selected only inside the interaction radius', () => {
  const exhibits = [{ id: 'one', x: 300, y: 240 }, { id: 'two', x: 700, y: 240 }];

  assert.equal(findNearestExhibit({ x: 318, y: 250 }, exhibits, 60).id, 'one');
  assert.equal(findNearestExhibit({ x: 100, y: 100 }, exhibits, 60), null);
});

test('camera follows the player without exposing space outside the world', () => {
  const camera = getCamera({ x: 30, y: 40 }, { width: 960, height: 540 }, WORLD_SIZE);

  assert.deepEqual(camera, { x: 0, y: 0 });
  assert.deepEqual(getCamera({ x: 2300, y: 1540 }, { width: 960, height: 540 }, WORLD_SIZE), { x: 1440, y: 1060 });
});

test('walking into the museum door changes the exterior into an interior entry', () => {
  assert.equal(isAtMuseumDoor({ x: MUSEUM_DOOR.x, y: MUSEUM_DOOR.y + 18 }), true);
  assert.equal(isAtMuseumDoor({ x: MUSEUM_DOOR.x - 100, y: MUSEUM_DOOR.y }), false);
});
