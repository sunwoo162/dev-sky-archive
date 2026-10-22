# Dev Sky Archive completion plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current prototype into a complete static portfolio game that lets the user discover all catalogued repositories, enter category islands, and read evidence-backed project exhibits.

**Architecture:** Keep the buildless HTML/CSS/JavaScript architecture. JSON remains the research source of truth; the runtime fetches the repository inventory and uses the curated exhibit catalog for the playable presentation. Keep game-state transitions pure and test them independently from DOM rendering.

**Tech Stack:** HTML, CSS, browser JavaScript modules, Canvas 2D, Node built-in test runner, Python static HTTP server for preview.

**Spec:** `docs/repo-research.md` and `data/project-records.json`

## Global Constraints

- No external image or AI-generated asset is required for the current visual direction.
- Keep the game top-down and keyboard playable with click fallbacks.
- Never invent a team role; show `확인 필요` when repository evidence cannot confirm it.
- Do not read or store secrets from repositories.
- Use conventional commit messages: `feat:`, `fix:`, `test:`, `docs:`, or `chore:`.
- A PR requires a real remote repository; do not mix this project into the unrelated dirty `fire-evac-ai-hackathon` checkout.

## Review Focus

- A visitor must be able to discover the 35-repository inventory even when a repository is not a featured exhibit.
- Every featured project must expose a development timeline and evidence/source label.
- Long island indexes must remain usable on small screens.
- A missing inventory fetch must not blank the playable map.
- GitHub links must open the recorded repository and local-only project actions must be visibly disabled instead of silently failing.

---

### Task 1: Add a complete archive index surface

**Files:**
- Modify: `index.html`
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Test: `tests/project-records.test.mjs`

**Interfaces:**
- Consumes: `data/repo-inventory.json` with `{ repositories: Array<{name, classification, note}> }`.
- Produces: a visible `ARCHIVE INDEX` overlay opened from the sky map and closed with a button or `Escape`.

- [ ] Add a failing data assertion that the inventory contains the seven classifications used by the index and that every item has a note.
- [ ] Run the focused test and confirm it fails if the classification contract is absent.
- [ ] Add the sky-map index trigger, modal markup, and a resilient fetch/render path for the inventory.
- [ ] Add keyboard close behavior and a fallback message when JSON cannot be loaded.
- [ ] Style the modal as part of the existing dark archive UI and keep the list scrollable on mobile.
- [ ] Run the focused test and verify the modal through a local browser preview.
- [ ] Commit as `feat: add repository archive index`.

### Task 2: Strengthen project exhibit metadata

**Files:**
- Modify: `src/content.js`
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Test: `tests/project-records.test.mjs`

**Interfaces:**
- Consumes: curated project fields `repo`, `repoUrl`, `role`, `stack`, `timeline`, and `detailSource`.
- Produces: exhibit metadata for repository, status, role certainty, stack, development log, and source.

- [ ] Add assertions for the required metadata fields in the curated catalog.
- [ ] Run the focused test and confirm the new contract fails before implementation.
- [ ] Render repository/status metadata and make GitHub actions real anchors; keep local-only actions disabled.
- [ ] Add an explicit role certainty label when the role is `needs-confirmation`.
- [ ] Run all Node tests and inspect one personal and one team exhibit in the browser.
- [ ] Commit as `feat: expose project evidence in exhibits`.

### Task 3: Accessibility, responsive behavior, and interaction polish

**Files:**
- Modify: `index.html`
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Test: `tests/game-state.test.mjs`

**Interfaces:**
- Consumes: existing screen state transitions and keyboard controls.
- Produces: accessible labels, reduced-motion behavior, focusable controls, and stable island/project navigation.

- [ ] Add tests for unknown island/project fallback and `Escape`-compatible state transitions where the pure state module owns them.
- [ ] Run the focused test and confirm the new behavior is not yet covered.
- [ ] Add `aria-live` status text, modal focus entry/return, visible focus styles, and a `prefers-reduced-motion` CSS branch.
- [ ] Ensure the canvas remains a visual layer while all project markers remain keyboard/click accessible.
- [ ] Run all tests and perform desktop plus narrow viewport browser checks.
- [ ] Commit as `fix: polish archive navigation accessibility`.

### Task 4: Repository bootstrap and release verification

**Files:**
- Create: `.gitignore`
- Create: `CONTRIBUTING.md`
- Create: `.github/pull_request_template.md`
- Modify: `README.md`
- Test: all existing tests and browser smoke flow

**Interfaces:**
- Consumes: the completed static project and the commit/PR conventions above.
- Produces: a local Git history ready to connect to the correct GitHub remote, with a reproducible verification checklist.

- [ ] Add only build/runtime clutter to `.gitignore` and document local development commands.
- [ ] Document commit and PR rules, including test commands, browser QA, screenshots, and role-confirmation notes.
- [ ] Run `node --test tests/*.mjs`, syntax checks, HTTP 200 check, and the full sky → island → exhibit → back flow.
- [ ] Initialize Git only inside `outputs/dev-sky-archive`, create `feat/dev-sky-archive`, and make small conventional commits for the completed work.
- [ ] Do not create a PR until a target remote is explicitly available; report the exact missing remote if it is not.
