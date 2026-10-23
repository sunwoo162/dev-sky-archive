# Pixel Asset System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace CSS-only world decoration with an original, data-driven pixel asset system while preserving the current portfolio exploration flow.

**Architecture:** Local SVG assets are grouped by visual responsibility and exposed through `src/asset-catalog.js`. The sky screen uses asset-backed island buttons, while the island canvas preloads and draws asset IDs from the current island/project data. The data model remains the source of positions and content.

**Tech Stack:** Buildless HTML, CSS, JavaScript modules, Canvas 2D, local SVG, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-23-pixel-asset-system-design.md`

## Global Constraints

- Preserve sky map → island → project exhibit navigation.
- Keep the app dependency-free and GitHub Pages compatible.
- Do not copy Zombie High Maker assets or proprietary artwork.
- Keep keyboard access, focus-visible states, and reduced-motion support.
- Real portfolio materials remain temporary until the user supplies them.

## Review Focus

- Missing or malformed asset URLs should fall back to a visible placeholder, not break the canvas.
- A project without an explicit asset ID should still render using the catalog fallback.
- SVG assets must remain crisp when the canvas is scaled responsively.
- The sky map must keep island names and counts readable after replacing CSS shapes.
- The new asset layer must not break the existing 21 behavior/content tests.

### Task 1: Add the original pixel asset library

**Files:**
- Create: `assets/world/*.svg`
- Create: `assets/tiles/*.svg`
- Create: `assets/characters/*.svg`
- Create: `assets/props/*.svg`
- Create: `assets/ui/*.svg`
- Create: `assets/projects/*.svg`
- Create: `src/asset-catalog.js`
- Test: `tests/asset-system.test.mjs`

**Interfaces:**
- Produces `assetCatalog`, `assetUrl(id)`, and `assetIds` from `src/asset-catalog.js`.
- Every catalog entry has an ID, category, local path, and alt label.

- [ ] Add hand-authored SVG sprites with hard pixel edges and category-specific palettes.
- [ ] Add the catalog and fallback asset ID.
- [ ] Add tests for category coverage, local file existence, and fallback resolution.
- [ ] Run `node --test tests/asset-system.test.mjs`.
- [ ] Commit `feat: add original pixel asset catalog`.

### Task 2: Connect project and island data to assets

**Files:**
- Modify: `src/content.js`
- Modify: `src/app.js`
- Modify: `tests/project-records.test.mjs`
- Test: `tests/asset-system.test.mjs`

**Interfaces:**
- Project records may provide `assetId`; islands provide `worldAssetId`.
- `assetUrl(id)` is the only URL lookup used by rendering code.

- [ ] Add deterministic world asset IDs to all four islands and curated project markers.
- [ ] Replace island button CSS geometry with asset-backed `<img>` markup and alt-safe labels.
- [ ] Preload catalog images once and draw them in the island canvas with fallback behavior.
- [ ] Add tests that every island and playable project has a valid asset mapping.
- [ ] Run the full Node test suite and syntax checks.
- [ ] Commit `feat: render portfolio world from pixel assets`.

### Task 3: Rework the visual shell around the asset system

**Files:**
- Modify: `index.html`
- Modify: `src/styles.css`
- Modify: `tests/ui-polish.test.mjs`

- [ ] Add the asset-palette/editor chrome language to the island toolbar, world frame, marker labels, and material cards.
- [ ] Remove obsolete pseudo-shape rules that no longer own the island artwork.
- [ ] Keep responsive layouts readable at desktop and mobile widths.
- [ ] Verify focus, reduced-motion, and long exhibit scrolling behavior.
- [ ] Run browser QA against local HTTP and the public Pages URL.
- [ ] Commit `style: apply pixel asset visual system`.

### Task 4: Release verification

**Files:**
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`

- [ ] Document the asset folder contract and how to replace temporary project materials.
- [ ] Run `node --test tests/*.mjs`, all `node --check` commands, and `git diff --check`.
- [ ] Open a PR, wait for CI, merge to `main`, and verify Pages deployment.
- [ ] Confirm the public flow reaches an exhibit and its material slots.
