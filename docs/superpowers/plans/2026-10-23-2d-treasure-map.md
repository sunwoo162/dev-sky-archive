# 2D 보물지도 월드맵 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the unreadable 3D landing scene with a responsive 2D parchment treasure map that routes five Korean portfolio categories into the existing detailed 2D worlds.

**Architecture:** A new `src/treasure-map.js` module will render a data-driven SVG map and accessible landmark buttons. `src/app.js` will connect landmark selection to the existing `enterIsland` state transition, while the existing Canvas-based island screens and project exhibits remain unchanged. The old Three.js landing renderer will no longer be loaded by the app.

**Tech Stack:** Buildless HTML, CSS, browser ES modules, inline SVG, existing Canvas 2D map, Node test runner, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-23-2d-treasure-map-design.md`

## Global Constraints

- External bundlers and new runtime dependencies are not added.
- GitHub Pages static deployment remains supported.
- Existing project data, temporary material slots, detailed 2D worlds, WASD/E-key flow, and accessible controls remain intact.
- Map decoration and landmarks are built from local SVG strings or CSS shapes; reference artwork is not copied.
- `prefers-reduced-motion` reduces route and focus decoration animation.

## Review Focus

- A landmark click or keyboard activation must enter the matching island, not a neighboring category; covered by `tests/treasure-map.test.mjs` and existing game-state tests.
- The five map coordinates and landmark types must stay unique and data-driven; covered by `tests/project-records.test.mjs`.
- The app must still load without Three.js/WebGL; covered by the absence of the Three.js import from `src/app.js` and the SVG map hook test.
- Focused landmark buttons must remain visible and readable at small widths; covered by responsive CSS assertions and browser QA.
- Reduced motion must not remove navigation or selection feedback; covered by existing accessibility tests and the map module's motion class.

### Task 1: Define map data and regression tests

**Files:**
- Modify: `src/content.js` island records
- Create: `tests/treasure-map.test.mjs`
- Modify: `tests/project-records.test.mjs`

**Interfaces:**
- Produces `island.map = { x, y, landmark, label }` for the five islands.
- The map data uses percentages in a 1200×760 viewBox and the exact landmark values `profile`, `personal`, `team`, `external`, `study`.

- [ ] **Step 1: Write failing assertions** for five unique map positions, Korean labels, and one-to-one landmark types.
- [ ] **Step 2: Run `node --test tests/treasure-map.test.mjs tests/project-records.test.mjs`** and confirm the new map assertions fail before implementation.
- [ ] **Step 3: Add the map fields** to `src/content.js` without changing project lists or island IDs.
- [ ] **Step 4: Run the focused tests** and confirm they pass.

### Task 2: Build the SVG treasure-map renderer

**Files:**
- Create: `src/treasure-map.js`
- Test: `tests/treasure-map.test.mjs`

**Interfaces:**
- Consumes `renderTreasureMap({ container, islands, onSelect, reducedMotion })`.
- Produces an inline SVG with parchment background, border, coastlines, mountains, compass, route paths, and five `<button>` landmark controls.

- [ ] **Step 1: Add source-level tests** for the renderer export, `viewBox="0 0 1200 760"`, Korean landmark labels, `aria-label`, and `data-island-id` hooks.
- [ ] **Step 2: Run the focused test** and confirm it fails because the module does not exist.
- [ ] **Step 3: Implement `renderTreasureMap`** with a pure SVG markup builder, landmark-specific inline symbols, and event delegation that calls `onSelect(islandId)`.
- [ ] **Step 4: Add reduced-motion handling** by applying a `reduced-motion` class and omitting route animation when requested.
- [ ] **Step 5: Run the focused test** and confirm it passes.

### Task 3: Replace the landing-screen wiring and visual system

**Files:**
- Modify: `index.html`
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `tests/ui-polish.test.mjs`
- Modify: `tests/asset-system.test.mjs`

**Interfaces:**
- `src/app.js` imports `renderTreasureMap` and calls it once with `islands`, `prefersReducedMotion`, and the existing `enterIsland` callback.
- `index.html` exposes `#treasure-map` and no longer requires `#sky-3d-canvas` or the Three.js import map for the landing screen.

- [ ] **Step 1: Add failing source assertions** that the landing screen has `#treasure-map`, no longer imports Three.js in `src/app.js`, and keeps the island transition callback.
- [ ] **Step 2: Run the UI/asset tests** and confirm the new landing assertions fail against the current 3D wiring.
- [ ] **Step 3: Replace the 3D canvas/fallback markup** with the map container and remove `setupSkyWorld`/Three.js import-map wiring from the application entrypoint.
- [ ] **Step 4: Import and initialize `renderTreasureMap`** in `src/app.js`, preserving the `enterIsland` state transition and focus behavior.
- [ ] **Step 5: Replace the final sky overrides** in `src/styles.css` with parchment background, map framing, landmark labels, route styling, focus states, and narrow-screen rules.
- [ ] **Step 6: Run all tests and `node --check src/app.js src/treasure-map.js`** and confirm they pass.

### Task 4: Browser QA, documentation, and release

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-10-23-2d-treasure-map-design.md` if QA reveals a decision gap

- [ ] **Step 1: Start or refresh the local static server** and verify the first screen visibly shows the parchment map, five landmarks, route lines, and compass.
- [ ] **Step 2: Click each landmark** and verify it enters the matching 2D island; return to the map after each check.
- [ ] **Step 3: Verify keyboard focus and Enter/Space activation** for landmarks, plus reduced-motion behavior.
- [ ] **Step 4: Update README** to describe `2D treasure map → 2D island world → project exhibit` and the new module.
- [ ] **Step 5: Run `node --test tests/*.mjs`, `node --check src/app.js`, `node --check src/treasure-map.js`, and `git diff --check`.**
- [ ] **Step 6: Commit with `feat: replace 3d sky hub with treasure map` and push the existing feature branch.**
- [ ] **Step 7: Update PR #2 with the new screenshots/verification summary without committing unrelated untracked evidence files.**
