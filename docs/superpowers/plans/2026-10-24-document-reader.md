# 자료 보관함 문서 리더 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프로젝트 전시의 임시 자료 카드를 실제로 읽을 수 있는 인라인 문서 리더로 확장한다.

**Architecture:** 기존 `renderProject` 흐름을 유지하면서 자료 카드를 버튼으로 렌더링하고, 같은 섹션 안에 문서 리더를 삽입한다. 문서 본문은 현재 프로젝트 데이터와 자료 종류별 임시 안내를 조합하며, 리더 상태는 해당 전시 렌더링 범위 안에서만 관리한다.

**Tech Stack:** Vanilla JavaScript ES modules, semantic HTML, CSS, Node.js built-in test runner, GitHub Pages static deployment.

**Spec:** `docs/superpowers/specs/2026-10-24-document-reader-design.md`

## Global Constraints

- 랜딩 보물지도와 기존 보물지도 디자인 방향은 변경하지 않는다.
- 실제로 제공되지 않은 개인 자료·역할·성과·수치를 만들어내지 않는다.
- 모든 자료 카드는 `임시 초안` 상태를 명시한다.
- 빌드 도구와 외부 의존성을 추가하지 않는다.
- 키보드 활성화, `Escape` 닫기, 닫은 뒤 포커스 복귀를 지원한다.

## Review Focus

- 자료 카드가 링크처럼 보이지만 키보드로 열리지 않는 경우 — 카드 버튼과 `Enter`/`Space` 기본 활성화를 테스트한다.
- 여러 자료를 연속으로 열 때 이전 본문이 남는 경우 — 새 선택이 리더 내용을 완전히 교체하는지 테스트한다.
- `Escape` 이후 포커스가 사라지는 경우 — 닫힌 뒤 마지막 카드에 포커스가 복귀하는지 테스트한다.
- 실제 자료가 없는 상태에서 사실처럼 보이는 문장이 생기는 경우 — 모든 리더에 `임시 초안`/교체 안내가 있는지 테스트한다.
- 모바일에서 긴 문서가 가로로 넘치는 경우 — 리더와 카드 그리드의 반응형 CSS를 확인한다.

### Task 1: 문서 리더 계약을 고정하는 테스트 작성

**Files:**
- Modify: `tests/project-records.test.mjs`
- Modify: `tests/accessibility.test.mjs`

**Interfaces:**
- Consumes: existing `project.materials` metadata and `src/app.js` source assertions.
- Produces: regression assertions for material buttons, reader markup, temporary status, and focus behavior.

- [x] **Step 1: Add failing assertions for the reader contract**
  - Assert `data-material-kind`, `materials-reader`, `aria-live="polite"`, `material-reader-close`, and `Escape` handling patterns exist.
  - Assert material cards are rendered as buttons rather than static articles.
- [x] **Step 2: Run the targeted tests and verify they fail**
  - Run: `node --test tests/project-records.test.mjs tests/accessibility.test.mjs`
  - Expected: FAIL because the current static cards do not expose the reader contract.

### Task 2: 카드와 임시 문서 리더 구현

**Files:**
- Modify: `src/app.js:262-330`

**Interfaces:**
- Consumes: `project.materials`, `project.summary`, `project.role`, `project.stack`, `project.timeline`, and `project.detailSource`.
- Produces: clickable material buttons and an inline `#materials-reader` that can be opened, replaced, and closed.

- [x] **Step 1: Change `renderMaterials(project)` to render accessible buttons**
  - Preserve existing asset art, labels, descriptions, and temporary status.
  - Add `data-material-kind` and an explicit `aria-label` describing the document action.
- [x] **Step 2: Add material-specific temporary document copy**
  - Map each of the eight material kinds to a short purpose, replacement instruction, and document body.
  - Use only existing project metadata for project-specific context.
- [x] **Step 3: Add reader markup and event wiring in `renderProject()`**
  - Render the reader below the grid with `hidden` state and `aria-live="polite"`.
  - Open on card click, replace the selected document, focus the close button, close on button/Escape, and restore the last card focus.
- [x] **Step 4: Run targeted tests and verify they pass**
  - Run: `node --test tests/project-records.test.mjs tests/accessibility.test.mjs`
  - Expected: PASS.

### Task 3: 문서 리더 시각 계층과 반응형 스타일

**Files:**
- Modify: `src/styles.css:171-190`

**Interfaces:**
- Consumes: `.materials-reader`, `.material-reader-*`, and button card classes from Task 2.
- Produces: a readable dark exhibit reader that remains visually separate from, and does not alter, the parchment map.

- [x] **Step 1: Style interactive card states**
  - Remove native button chrome, preserve the existing card art, and add hover/focus-visible/selected states.
- [x] **Step 2: Style the reader panel**
  - Add title/meta/body/note hierarchy, scroll-safe long copy, and a visible temporary-document notice.
- [x] **Step 3: Add mobile layout rules**
  - Stack reader metadata and controls, keep text within the viewport, and preserve the existing two-column-to-one-column material grid.
- [x] **Step 4: Run UI/static tests**
  - Run: `node --test tests/*.mjs`
  - Expected: PASS.

### Task 4: 브라우저 검증 및 릴리스 기록

**Files:**
- Modify: `CHANGELOG.md` or the existing release documentation only if the repository already uses one.

- [x] **Step 1: Run syntax and test verification**
  - Run: `node --test tests/*.mjs`, `node --check src/app.js`, `node --check src/content.js`, `node --check src/game-state.js`, `node --check src/treasure-map.js`, `git diff --check`.
- [x] **Step 2: Verify the local preview in the browser**
  - Open a project exhibit, click at least two different material cards, verify the reader replaces content, close with the button and `Escape`, and verify focus returns.
  - Verify the landing map remains the same treasure-map composition.
- [ ] **Step 3: Commit the implementation**
  - `git add docs/superpowers/specs/2026-10-24-document-reader-design.md docs/superpowers/plans/2026-10-24-document-reader.md src/app.js src/styles.css tests/project-records.test.mjs tests/accessibility.test.mjs`
  - `git commit -m "feat: add project material document reader"`
- [ ] **Step 4: Push and update the existing PR**
  - `git push origin feat/pixel-asset-system`
  - Keep PR #2; do not create a duplicate PR.
