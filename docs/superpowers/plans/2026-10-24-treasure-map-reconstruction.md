# Treasure Map Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the landing screen as a dense hand-drawn treasure-map illustration while preserving the seven accessible island entry points.

**Architecture:** Keep `src/treasure-map.js` as the inline SVG composition boundary. The SVG owns paper, cartography, routes, and ink illustrations; HTML buttons remain the accessible overlay interaction layer. CSS supplies the common parchment/ink treatment and responsive hit-area behavior.

**Tech Stack:** Buildless HTML, CSS, JavaScript modules, inline SVG, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-24-treasure-map-reconstruction-design.md`

## Global Constraints

- No 3D landing screen or external raster asset pipeline.
- Preserve seven map entries and `data-island-id` click/focus behavior.
- Use only local inline SVG/CSS/JavaScript and keep the project dependency-free.
- Keep Korean labels readable and do not expose decorative SVG as duplicate screen-reader content.

## Review Focus

- Small viewport: the illustration and seven hit areas remain inside the parchment frame.
- Keyboard focus: focused labels remain visible without changing the selected island contract.
- Decorative SVG failure: missing or unsupported SVG filters must leave a readable parchment map.
- Data drift: a future island with a new landmark id must still render a safe fallback art shape.
- Reduced motion: hover/focus effects remain static when the archive requests reduced motion.

### Task 1: Lock the illustration contract with tests

**Files:**
- Modify: `tests/treasure-map.test.mjs`

- [x] **Step 1: Write the failing test**
- [x] **Step 2: Run the targeted test and confirm it fails because the new illustration layers are absent**

### Task 2: Recompose the inline map illustration

**Files:**
- Modify: `src/treasure-map.js`
- Modify: `src/styles.css`

- [x] **Step 1: Replace the sparse coast/decorative composition with named hand-drawn groups**
- [x] **Step 2: Retain accessible HTML landmark overlays and add quiet parchment label styling**
- [x] **Step 3: Run the targeted map tests and full suite**

### Task 3: Browser QA and release record

**Files:**
- Modify: `README.md`
- Modify: this plan

- [x] **Step 1: Inspect the local landing screenshot at desktop width**
- [x] **Step 2: Click `자료` and `작업` to confirm the new map composition did not break navigation**
- [x] **Step 3: Run full tests, `git diff --check`, commit, and push**

