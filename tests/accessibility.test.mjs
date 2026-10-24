import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'index.html'), 'utf8');
const css = readFileSync(join(here, '..', 'src', 'styles.css'), 'utf8');
const app = readFileSync(join(here, '..', 'src', 'app.js'), 'utf8');
const treasureMapSource = readFileSync(join(here, '..', 'src', 'treasure-map.js'), 'utf8');

test('the playable world exposes live interaction feedback to assistive technology', () => {
  assert.match(html, /id="interaction-text"[^>]*aria-live="polite"/);
  assert.match(html, /id="game-canvas"[^>]*aria-label="항구에서 박물관까지 이동하는 2D 탑다운 프로젝트 월드"/);
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
  assert.match(app, /if \(projectFocusTarget\) projectFocusTarget\.focus\(\)/);
  assert.match(app, /else canvas\.focus\(\)/);
  assert.match(app, /else if \(state\.screen === ['"]island['"]\) returnToSky\(\)/);
  assert.match(app, /treasureMapApi\?\.focusLandmark\(previousIslandId\)/);
});

test('travel screen exposes route progress and destination tip', () => {
  assert.match(html, /id="travel-screen"[^>]*aria-live="polite"/);
  assert.match(html, /id="travel-route"[^>]*aria-label="현재 항해 경로"/);
  assert.match(html, /id="travel-progress-fill"/);
  assert.match(html, /id="travel-tip"/);
  assert.match(html, /assets\/maps\/treasure-map-etched\.png/);
  assert.match(app, /findShortestPath/);
  assert.match(app, /getTravelDuration/);
  assert.match(css, /\.travel-screen\s*\{/);
});

test('map landmark activation stays native and reduced motion remains immediate', () => {
  assert.match(treasureMapSource, /<button class="treasure-map-landmark/);
  assert.match(treasureMapSource, /type="button"/);
  assert.match(app, /reducedMotion: prefersReducedMotion/);
  assert.match(app, /onSelect: enterSelectedIsland/);
});

test('atlas travel keeps the same sepia handoff language as the map', () => {
  assert.match(css, /\.travel-screen:not\(\.is-hidden\)[^}]*animation:/);
  assert.match(css, /@keyframes atlas-travel-in/);
  assert.match(css, /\.travel-screen::before[^}]*rgba\(91, 59, 39/);
  assert.doesNotMatch(css, /#3d7774|#3d5c58/);
  assert.match(css, /\.travel-screen\s*\{[^}]*--travel-accent:\s*#a94737/);
  assert.match(css, /@keyframes atlas-travel-in[\s\S]*\.travel-screen:not\(\.is-hidden\)\s*\{\s*animation:\s*none/);
});

test('the archive declares its adapted design-system layers', () => {
  assert.match(html, /data-ui-system="nc-portal-play-adapted"/);
  assert.match(html, /data-ui-layer="navigation"/);
  assert.match(html, /data-ui-layer="status-surface"/);
  assert.match(html, /class="world-hud world-hud-top"/);
  assert.match(html, /data-ui-layer="dossier"/);
  assert.match(css, /--ui-canvas/);
  assert.match(css, /--ui-primary/);
  assert.match(css, /--ui-hairline/);
  assert.match(css, /--ui-control-radius/);
  assert.match(css, /--ui-card-radius/);
});

test('project material documents expose an accessible reader lifecycle', () => {
  assert.match(app, /<button class="material-card/);
  assert.match(app, /aria-live="polite"/);
  assert.match(app, /data-material-kind/);
  assert.match(app, /event\.key === ['"]Escape['"]/);
  assert.match(app, /lastMaterialFocus/);
});

test('project museum guides expose both keyboard and pointer entry points', () => {
  assert.match(html, /id="museum-modal"[^>]*role="dialog"/);
  assert.match(html, /id="museum-modal-content"/);
  assert.match(html, /id="museum-open-project"/);
  assert.match(html, /<kbd>J<\/kbd>/);
  assert.match(app, /openMuseumGuide/);
  assert.match(app, /handleWorldClick/);
  assert.match(app, /findNearestExhibit/);
  assert.match(app, /key === ['"]j['"]/);
  assert.match(app, /trapMuseumFocus/);
  assert.match(css, /\.museum-modal\s*\{/);
});
