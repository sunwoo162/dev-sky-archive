import assert from 'node:assert/strict';
import test from 'node:test';
import {
  TRAVEL_GRAPH,
  findShortestPath,
  getTravelDuration,
  getTravelTip,
} from '../src/travel.js';
import { findIsland } from '../src/content.js';

test('BFS returns the shortest route between connected categories', () => {
  assert.deepEqual(findShortestPath('materials', 'personal'), ['materials', 'team', 'personal']);
  assert.deepEqual(findShortestPath('personal', 'external'), ['personal', 'profile', 'external']);
});

test('BFS returns a single node when the player is already there', () => {
  assert.deepEqual(findShortestPath('profile', 'profile'), ['profile']);
});

test('BFS returns an empty route for an unknown category', () => {
  assert.deepEqual(findShortestPath('missing', 'profile'), []);
  assert.deepEqual(findShortestPath('profile', 'missing'), []);
});

test('travel duration grows with each additional hop and stays capped', () => {
  assert.equal(getTravelDuration(['profile']), 0);
  assert.equal(getTravelDuration(['profile', 'personal']), 1800);
  assert.equal(getTravelDuration(['profile', 'personal', 'team']), 2700);
  assert.equal(getTravelDuration(['profile', 'personal', 'team', 'materials', 'work', 'study', 'external']), 6300);
  assert.equal(getTravelDuration(['profile', 'personal', 'team', 'materials', 'work', 'study', 'external', 'profile']), 6500);
});

test('travel tips use a project summary for a single-project island', () => {
  const profile = findIsland('profile');
  const personal = findIsland('personal');

  assert.equal(getTravelTip(profile), profile.projects[0].summary);
  assert.equal(getTravelTip(personal), personal.description);
});

test('the graph contains every category in the archive', () => {
  const categoryIds = ['profile', 'personal', 'team', 'external', 'study', 'materials', 'work'];
  categoryIds.forEach((id) => assert.ok(TRAVEL_GRAPH[id], `${id} needs a travel node`));
});
