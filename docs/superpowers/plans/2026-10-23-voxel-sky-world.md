# Voxel Sky World Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the flat sky island cards with a real modular isometric 3D sky hub built from reusable block tiles.

**Architecture:** A focused `src/sky-3d.js` module creates a Three.js orthographic scene and exposes `createSkyWorld`/`destroy`. The existing app keeps navigation and accessible DOM controls; the 3D canvas is the visual layer and dispatches island selection through a callback.

**Tech Stack:** Buildless HTML modules, Three.js WebGLRenderer, OrthographicCamera, flat-shaded BoxGeometry/CylinderGeometry, Node test runner, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-23-voxel-sky-world-design.md`

## Global Constraints

- Keep sky → island → project exhibit navigation intact.
- Keep the 2D island canvas and project exhibit unchanged in behavior.
- Use grid-snapped authored geometry; no AI-generated images in the shipped world.
- Preserve keyboard access, focus-visible states, and reduced-motion behavior.
- Keep the app buildless and compatible with GitHub Pages.

## Review Focus

- WebGL unavailable: show a readable fallback and keep DOM island buttons usable.
- Resize/orientation change: camera and renderer update without stretching the world.
- Pointer picking: only island groups activate, not clouds or decorative blocks.
- Reduced motion: disable floating/bobbing animation while keeping the scene visible.
- CDN import failure: page remains navigable through the existing DOM controls.

### Task 1: Add the modular 3D scene module

**Files:**
- Create: `src/sky-3d.js`
- Modify: `index.html`
- Test: `tests/asset-system.test.mjs`

- [x] Define the `createSkyWorld({ canvas, islands, onSelect, reducedMotion })` interface.
- [x] Add grid tile factories and category building compositions.
- [x] Add orthographic camera, flat-shaded lights, clouds, island picking, resize, and cleanup.
- [x] Add a readable fallback state for WebGL/import failures.
- [x] Add static tests for the scene module contract and import map.

### Task 2: Connect the scene to navigation

**Files:**
- Modify: `src/app.js`
- Modify: `index.html`
- Modify: `src/styles.css`

- [x] Add the sky WebGL canvas host and scene lifecycle.
- [x] Keep existing island buttons as visually hidden accessible controls.
- [x] Route 3D island picks to `enterIsland` and refresh the scene when returning to sky.
- [x] Match the current responsive shell and reduced-motion preference.

### Task 3: Verify and package

**Files:**
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`

- [x] Run the full Node suite, syntax checks, and diff checks.
- [x] Browser QA the 3D sky map, keyboard fallback, 2D island, and exhibit.
- [x] Update docs with the tile grammar and Three.js scene entry point.
- [x] Commit and push the implementation to PR #2.
