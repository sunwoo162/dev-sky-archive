import assert from 'node:assert/strict';
import test from 'node:test';
import {
  closeProject,
  createInitialState,
  enterIsland,
  exitToSky,
  openProject,
} from '../src/game-state.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('selecting an island moves from the sky map into its 2D world', () => {
  const next = enterIsland(createInitialState(), 'team');

  assert.deepEqual(next, {
    screen: 'island',
    islandId: 'team',
    projectId: null,
  });
});

test('opening a project from a 2D world shows the project exhibit', () => {
  const next = openProject(
    enterIsland(createInitialState(), 'personal'),
    'washer',
  );

  assert.deepEqual(next, {
    screen: 'project',
    islandId: 'personal',
    projectId: 'washer',
  });
});

test('closing a project returns to the same 2D world', () => {
  const next = closeProject({
    screen: 'project',
    islandId: 'team',
    projectId: 'repo-dock',
  });

  assert.deepEqual(next, {
    screen: 'island',
    islandId: 'team',
    projectId: null,
  });
});

test('exiting an island returns to the sky map', () => {
  const next = exitToSky({
    screen: 'island',
    islandId: 'frontend',
    projectId: null,
  });

  assert.deepEqual(next, {
    screen: 'sky',
    islandId: null,
    projectId: null,
  });
});

test('map selection has a single transition lock around the existing route handoff', () => {
  const app = readFileSync(resolve('src/app.js'), 'utf8');

  assert.match(app, /let selectionTransitionLocked = false/);
  assert.match(app, /if \(selectionTransitionLocked \|\| activeTravel\) return/);
  assert.match(app, /selectionTransitionLocked = true/);
  assert.match(app, /selectionTransitionLocked = false/);
  assert.match(app, /findShortestPath\(currentMapLocationId, islandId\)/);
  assert.match(app, /getTravelDuration\(path\)/);
});
