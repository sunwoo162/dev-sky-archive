import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { islands } from '../src/content.js';
import { assetCatalog } from '../src/asset-catalog.js';

const here = dirname(fileURLToPath(import.meta.url));
const readJson = (fileName) => JSON.parse(readFileSync(join(here, '..', 'data', fileName), 'utf8'));
const records = readJson('project-records.json');
const inventory = readJson('repo-inventory.json');
const appSource = readFileSync(join(here, '..', 'src', 'app.js'), 'utf8');

test('the current portfolio game is represented as a first-class project record', () => {
  const project = records.projects.find((item) => item.id === 'dev-sky-archive');

  assert.ok(project);
  assert.equal(project.title, 'Dev Sky Archive');
  assert.equal(project.category, 'personal');
  assert.ok(project.stack.includes('Canvas'));
  assert.ok(project.developmentTimeline.length >= 3);
});

test('the playable world uses five portfolio hubs and two operations hubs', () => {
  assert.deepEqual(islands.map((island) => island.id), ['profile', 'personal', 'team', 'external', 'study', 'materials', 'work']);
  assert.deepEqual(islands.map((island) => island.shortTitle), ['프로필', '개인', '팀', '대외활동', '스터디', '자료', '작업']);
  assert.equal(islands.find((island) => island.id === 'profile').projects[0].id, 'profile-core');
});

test('operations hubs reserve future document and AI progress surfaces', () => {
  const materials = islands.find((island) => island.id === 'materials');
  const work = islands.find((island) => island.id === 'work');

  assert.equal(materials.kind, 'materials');
  assert.equal(work.kind, 'work');
  assert.match(materials.description, /문서|자료/);
  assert.match(work.description, /AI|작업|연결/);
  assert.ok(materials.projects.some((project) => project.id === 'materials-index'));
  assert.ok(work.projects.some((project) => project.id === 'work-queue'));
  assert.ok(work.projects.every((project) => project.status === 'awaiting-connection'));
});

test('every curated project has the fields needed by the game exhibit', () => {
  for (const project of records.projects) {
    assert.ok(project.id);
    assert.ok(project.title);
    assert.ok(project.summary);
    assert.ok(Array.isArray(project.stack));
    assert.ok(Array.isArray(project.developmentTimeline));
    assert.ok(project.role.status);
    assert.ok(project.evidence.length > 0);
  }
});

test('the repository inventory keeps every discovered repository name', () => {
  assert.equal(inventory.owner, 'sunwoo162');
  assert.ok(inventory.repositories.length >= 35);
  for (const name of ['Washer-Client-v2', 'Playground', 'TIL', 'RD', 'gleave', 'claimlatch']) {
    assert.ok(inventory.repositories.some((repo) => repo.name === name));
  }
});

test('the repository inventory is ready for a complete archive index', () => {
  const classifications = new Set(inventory.repositories.map((repo) => repo.classification));
  const html = readFileSync(join(here, '..', 'index.html'), 'utf8');

  assert.deepEqual([...classifications].sort(), [
    'candidate-project',
    'dependency-or-study',
    'empty-or-placeholder',
    'learning-log',
    'profile-tooling',
    'sandbox',
    'tooling',
  ]);
  for (const repo of inventory.repositories) {
    assert.ok(repo.name);
    assert.ok(repo.note, `${repo.name} needs an inventory note`);
  }
  assert.match(html, /id="archive-index-trigger"/);
});

test('the playable exhibit catalog exposes development logs for every project', () => {
  const projects = islands.flatMap((island) => island.projects);

  assert.ok(projects.length >= 10);
  assert.deepEqual(
    projects.map((project) => project.id).sort(),
    records.projects.map((project) => project.id).sort(),
  );
  for (const project of projects) {
    assert.ok(Array.isArray(project.timeline) && project.timeline.length >= 2, `${project.id} needs a timeline`);
    assert.ok(project.repo || project.id === 'dev-sky-archive', `${project.id} needs a repository link or local record`);
  }
});

test('every playable exhibit exposes repository and role certainty metadata', () => {
  const projects = islands.flatMap((island) => island.projects);

  for (const project of projects) {
    assert.ok(project.repo, `${project.id} needs a repository reference`);
    assert.ok(project.status, `${project.id} needs a status`);
    assert.ok(['self-recorded', 'needs-confirmation'].includes(project.roleStatus), `${project.id} needs role certainty metadata`);
    assert.ok(project.repoUrl || project.id === 'dev-sky-archive', `${project.id} needs a GitHub URL or local-only exception`);
    assert.ok(project.detailSource, `${project.id} needs a source label`);
  }
});

test('every island and exhibit is connected to the pixel asset catalog', () => {
  for (const island of islands) {
    assert.ok(island.map?.landmark, `${island.id} needs a treasure-map landmark`);
    assert.ok(island.map?.label, `${island.id} needs a Korean treasure-map label`);
    for (const project of island.projects) {
      assert.ok(assetCatalog[project.assetId], `${project.id} needs a project asset`);
    }
  }
});

test('every playable exhibit exposes temporary portfolio material slots', () => {
  const projects = islands.flatMap((island) => island.projects);

  for (const project of projects) {
    assert.ok(Array.isArray(project.materials) && project.materials.length >= 4, `${project.id} needs portfolio material slots`);
    assert.deepEqual(
      new Set(project.materials.map((material) => material.kind)),
      new Set(['SCREEN', 'SYSTEM', 'ROLE', 'EVIDENCE', 'PORTFOLIO', 'SELFINTRO', 'PROJECT', 'OTHER']),
      `${project.id} needs every replacement material category`,
    );
    for (const material of project.materials) {
      assert.ok(material.kind, `${project.id} material needs a kind`);
      assert.ok(material.title, `${project.id} material needs a title`);
      assert.ok(material.description, `${project.id} material needs a description`);
      assert.equal(material.status, 'temporary', `${project.id} material should remain temporary until replaced`);
    }
  }

  assert.match(appSource, /exhibit-materials/);
  assert.match(appSource, /실제 자료로 교체/);
  assert.match(appSource, /data-material-kind/);
  assert.match(appSource, /materials-reader/);
  assert.match(appSource, /material-reader-close/);
});

test('playable exhibit metadata stays aligned with the records source of truth', () => {
  const projects = new Map(islands.flatMap((island) => island.projects).map((project) => [project.id, project]));

  for (const record of records.projects) {
    const project = projects.get(record.id);
    assert.ok(project, `${record.id} needs a playable exhibit`);
    assert.equal(project.status, record.status, `${record.id} status drifted from project-records.json`);
    assert.equal(project.roleStatus, record.role.status, `${record.id} role certainty drifted from project-records.json`);
  }
});

test('exhibit preview copy does not present unsourced repository facts as live data', () => {
  assert.doesNotMatch(appSource, /repodock \/ sprint 08|PR #142/);
  assert.match(appSource, /SCHEMATIC/);
});
