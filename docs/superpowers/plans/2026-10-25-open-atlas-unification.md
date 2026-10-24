# Open Atlas Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 첫 보물지도부터 항해 화면, 항구, 박물관, 프로젝트 문서까지 하나의 오픈 아틀라스 게임 세계처럼 보이도록 시각 언어와 전환 흐름을 통일한다.

**Architecture:** 기존 정적 HTML/CSS/Canvas 구조를 유지한다. `src/treasure-map.js`는 지도와 랜드마크의 단일 렌더러로 남기고, `src/app.js`는 선택된 랜드마크의 확대 연출과 기존 최단 경로 항해를 연결한다. 공통 팔레트·명판·호버 규칙은 `src/styles.css`에 토큰과 레이어로 둔다.

**Tech Stack:** Vanilla JavaScript ES modules, SVG raster composition, Canvas 2D, CSS, Node.js built-in test runner, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-25-open-atlas-unification-design.md`

## Global Constraints

- 첫 화면은 별도의 큰 프레임이나 물결형 외곽 분할 없이 보물지도 자체가 뷰포트를 채운다.
- 외부 이미지·AI 생성 이미지는 추가하지 않고 현재 로컬 지도와 SVG 에셋만 사용한다.
- 프로젝트 데이터 구조, GitHub 레포 인벤토리, J/E 문서 상호작용은 회귀시키지 않는다.
- 공통 시각 언어는 양피지 베이스 + 짙은 갈색 잉크 + 녹슨 붉은 포인트 + 금색 안내로 제한한다.
- 모바일/좁은 뷰포트에서도 지도 핫스팟이 접근 가능하고, reduced-motion 사용자는 확대 애니메이션 없이 같은 상태에 도달한다.

## Review Focus

- 좁거나 넓은 뷰포트에서 지도 이미지와 랜드마크 핫스팟의 비율이 어긋나지 않는가 — 지도 fit 규칙과 CSS 회귀 테스트로 고정한다.
- 선택한 랜드마크 확대 중 라벨이 잘리거나 클릭 영역이 이동하지 않는가 — transition class와 핫스팟 좌표 테스트로 고정한다.
- 확대 연출이 항해/섬 상태 전환과 경쟁하지 않는가 — transition 완료 후 한 번만 `enterSelectedIsland`가 실행되는지 테스트한다.
- 지도·항해·섬에서 명판 색과 포커스 대비가 유지되는가 — 공통 CSS 토큰과 접근성 테스트로 고정한다.
- 기존 키보드 탐방과 모달 포커스 복원이 깨지지 않는가 — 전체 회귀 테스트와 브라우저 수동 검증으로 확인한다.

---

### Task 1: 지도 레이아웃과 오픈 아틀라스 렌더러 계약 고정

**Files:**
- Modify: `src/treasure-map.js`
- Modify: `tests/treasure-map.test.mjs`
- Modify: `docs/superpowers/specs/2026-10-25-open-atlas-unification-design.md` only if an implementation decision changes the spec

**Interfaces:**
- Consumes: existing `renderTreasureMap({ container, islands, onSelect, reducedMotion })` and `island.map` coordinates.
- Produces: the existing `treasure-map-canvas`, `treasure-map-svg`, `treasure-map-landmarks`, `data-island-id`, and a transition state class that later tasks can observe.

- [ ] **Step 1: Write the failing renderer-contract tests**

  Extend `tests/treasure-map.test.mjs` to assert that the renderer keeps the raster map as the visual base, emits seven native landmark buttons, exposes `data-map-target`, and exposes a deterministic transition hook such as `is-zooming` without creating synthetic island artwork.

- [ ] **Step 2: Run the focused tests and verify the new contract fails**

  Run: `node --test tests/treasure-map.test.mjs`

  Expected: the new transition-hook assertion fails before implementation.

- [ ] **Step 3: Implement the renderer transition hook**

  Keep `renderTreasureMap` as the single map composer. On a valid landmark click, add `is-zooming` to the map container, set a data attribute for the selected island id, and invoke `onSelect` after the visual delay; skip the delay when `reducedMotion` is true. Keep pointer and keyboard activation native through the existing `<button>` elements.

- [ ] **Step 4: Run focused tests and verify they pass**

  Run: `node --test tests/treasure-map.test.mjs`

  Expected: all treasure-map tests pass.

- [ ] **Step 5: Commit the isolated renderer change**

  ```powershell
  git add src/treasure-map.js tests/treasure-map.test.mjs
  git commit -m "feat: add landmark zoom transition hook"
  ```

### Task 2: Full-bleed 지도와 공통 명판/호버 언어 정리

**Files:**
- Modify: `src/styles.css`
- Modify: `index.html` only if the map hint or wrapper needs semantic relocation
- Modify: `tests/treasure-map.test.mjs`

**Interfaces:**
- Consumes: Task 1 `is-zooming` and `data-selected-island` state, existing landmark classes.
- Produces: full-bleed map layout, shared sepia/ink tokens, map hover/focus/zoom styles used by the landing screen and reused by travel copy.

- [ ] **Step 1: Add failing CSS contract assertions**

  Assert that the map stage uses the viewport as its surface, the map wrapper does not add a large rounded/wavy frame, landmark labels use the shared sepia palette, and `.treasure-map.is-zooming` has a transform/opacity transition with a reduced-motion override.

- [ ] **Step 2: Run the focused tests and verify the assertions fail**

  Run: `node --test tests/treasure-map.test.mjs tests/accessibility.test.mjs`

  Expected: the new full-bleed/zoom assertions fail against the current wrapper styles.

- [ ] **Step 3: Implement the open-atlas styles**

  Remove only the CSS-added outer containment that duplicates the raster paper edge. Keep the raster map’s own texture. Use `object-fit: cover` for normal desktop viewports, preserve the existing centered coordinate system for hotspots, and use a contained/panned fallback at narrow widths so labels stay reachable. Apply one shared label treatment: transparent parchment, dark brown ink, thin border, and a restrained hover contrast change. Add `.treasure-map.is-zooming` with a landmark-centered transform hook and a reduced-motion rule.

- [ ] **Step 4: Run focused tests and inspect the landing screen**

  Run: `node --test tests/treasure-map.test.mjs tests/accessibility.test.mjs`

  Expected: all focused tests pass; local browser shows the map filling the viewport without the extra wavy frame.

- [ ] **Step 5: Commit the landing visual language**

  ```powershell
  git add src/styles.css index.html tests/treasure-map.test.mjs
  git commit -m "style: unify open atlas map surface"
  ```

### Task 3: 선택 지점 확대와 항해 연결

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `tests/game-state.test.mjs`
- Modify: `tests/accessibility.test.mjs`

**Interfaces:**
- Consumes: Task 1 renderer callback delay and existing `enterSelectedIsland(islandId)`, `startTravel`, `setScreen`, and `treasureMapApi`.
- Produces: exactly-once selection transition from a landmark zoom into the existing shortest-route travel screen; focus returns to the destination world canvas after arrival.

- [ ] **Step 1: Write failing transition tests**

  Add tests for one selection callback per click, reduced-motion immediate selection, and unchanged BFS route/travel duration after the zoom hook. Add a keyboard test ensuring an activated landmark remains a native button and does not trigger page scrolling.

- [ ] **Step 2: Run the focused tests and verify the new tests fail**

  Run: `node --test tests/game-state.test.mjs tests/accessibility.test.mjs`

  Expected: transition callback timing/once-only assertions fail before integration.

- [ ] **Step 3: Integrate the transition without changing route semantics**

  Guard selection with a small transition lock in `src/app.js`. Let the map zoom class run first, then call the existing destination selection/travel logic exactly once. Clear the lock on travel start or on a failed/unknown island id. Keep `prefers-reduced-motion` immediate. Do not add a second navigation model or URL contract.

- [ ] **Step 4: Add transition presentation styles**

  Give the travel screen a short visual handoff that reuses the map’s sepia/rust/gold palette. Keep the existing travel panel and shortest-path data, but remove any conflicting cold UI treatment so the voyage reads as the next layer of the same atlas.

- [ ] **Step 5: Run focused tests and browser-check the full selection flow**

  Run: `node --test tests/game-state.test.mjs tests/accessibility.test.mjs`

  Manual check: open the local site, activate a map landmark, observe the selected area zoom, confirm one travel screen, wait for the island, and verify the destination world still starts at the harbor.

- [ ] **Step 6: Commit the transition integration**

  ```powershell
  git add src/app.js src/styles.css tests/game-state.test.mjs tests/accessibility.test.mjs
  git commit -m "feat: connect map zoom to atlas travel"
  ```

### Task 4: 월드·박물관 명판과 문서 상호작용 통일

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `tests/island-world.test.mjs`
- Modify: `tests/asset-system.test.mjs`
- Modify: `README.md`
- Modify: `docs/design-system-adaptation.md`

**Interfaces:**
- Consumes: existing Canvas world functions `drawExteriorWorld`, `drawMuseumInterior`, `updateWorldHud`, `updateInteraction`, `enterMuseum`, and local `assetCatalog`.
- Produces: map-compatible labels and a coherent harbor→museum→exhibit visual hierarchy without changing J/E behavior.

- [ ] **Step 1: Add failing world-language assertions**

  Assert that the world renderer references the shared atlas palette/label helpers for harbor, museum, and exhibit states, that the HUD exposes only movement/document/map controls, and that the J interaction text remains project-specific.

- [ ] **Step 2: Run the focused tests and verify failure**

  Run: `node --test tests/island-world.test.mjs tests/asset-system.test.mjs tests/accessibility.test.mjs`

  Expected: the new shared-label/palette assertions fail before the cleanup.

- [ ] **Step 3: Refactor world composition around the same visual rules**

  Reuse one canvas label helper configuration for harbor, museum, exit, and exhibits. Remove any remaining generic filler UI, keep the museum’s structural objects purposeful, and preserve `J`, `E`, click, `ESC`, focus restoration, and reduced-motion behavior.

- [ ] **Step 4: Update documentation**

  Record the open-atlas rule and the zoom→travel→world flow in `README.md` and `docs/design-system-adaptation.md` without claiming external design-system assets were copied.

- [ ] **Step 5: Run focused tests and manual browser verification**

  Run: `node --test tests/island-world.test.mjs tests/asset-system.test.mjs tests/accessibility.test.mjs`

  Manual check: move from harbor to museum, approach an exhibit, open the Korean guide with J, close it, and confirm the player remains in the same room.

- [ ] **Step 6: Commit the world consistency pass**

  ```powershell
  git add src/app.js src/styles.css tests/island-world.test.mjs tests/asset-system.test.mjs README.md docs/design-system-adaptation.md
  git commit -m "style: align museum world with atlas language"
  ```

### Task 5: Release verification and handoff

**Files:**
- Modify: none unless verification finds a regression

- [ ] **Step 1: Run the complete local verification**

  ```powershell
  node --check src/app.js
  node --test tests/*.mjs
  git diff --check
  ```

  Expected: JavaScript syntax succeeds, all tests pass, and diff check emits no errors.

- [ ] **Step 2: Verify the browser at desktop and narrow widths**

  Check the open-atlas map, one landmark zoom, travel progress, harbor start, museum entry, J guide, E full exhibit, and ESC return. Check the map remains reachable at a narrow viewport and reduced motion skips the zoom delay.

- [ ] **Step 3: Push and verify GitHub Actions**

  ```powershell
  git push origin feat/pixel-asset-system
  ```

  Confirm the `Verify archive` workflow for the pushed commit is `completed / success` and that existing PR #2 points at the new head.

