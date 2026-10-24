# 작업·자료 허브와 보물지도 밀도 보강 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 보물지도에 자료·작업 허브를 추가하고 사용자가 보낸 원본 보물지도처럼 풍부한 선화 장식을 복원한다.

**Architecture:** 기존 `islands` 데이터 배열에 운영 허브 두 개를 추가하고 기존 `renderTreasureMap`의 데이터 기반 랜드마크 렌더링을 그대로 사용한다. 지도 장식은 `treasure-map.js`의 비인터랙티브 SVG 레이어에 추가하며, 프로젝트 월드와 자료 문서 리더는 기존 흐름을 재사용한다.

**Tech Stack:** Vanilla JavaScript ES modules, inline SVG, CSS, Node.js built-in test runner, GitHub Pages static deployment.

**Spec:** `docs/superpowers/specs/2026-10-24-work-materials-islands-design.md`

## Global Constraints

- 기존 양피지·갈색 잉크·점선 루트·나침반 보물지도 방향을 유지한다.
- 첫 지도에는 `프로필`, `개인 프로젝트`, `팀 프로젝트`, `대외활동`, `스터디`, `자료`, `작업` 7개 허브가 있다.
- `자료`와 `작업`은 기존 프로젝트 분류와 별도 운영 허브다.
- 실제 AI 연동이나 가짜 실시간 진행률은 구현하지 않는다.
- 외부 게임 에셋을 복사하지 않고 로컬 SVG 선화만 사용한다.

## Review Focus

- 신규 허브가 지도에는 보이지만 `findIsland`/상태 전환에서 열리지 않는 경우 — 데이터·게임 상태·브라우저 클릭을 함께 확인한다.
- 7개 랜드마크가 원본 보물지도 장식과 겹쳐 읽기 어려워지는 경우 — 좌표·레이어·라벨 대비를 확인한다.
- 자료/작업이 개인 프로젝트처럼 오해되는 경우 — 허브 kind와 한국어 설명을 확인한다.
- AI 연결 전인데 진행률을 사실처럼 보이는 경우 — 작업 허브에 `연결 대기`와 임시 상태를 표시하는지 확인한다.
- 모바일에서 새 랜드마크가 지도 밖으로 나가는 경우 — aspect ratio와 반응형 좌표를 확인한다.

### Task 1: 신규 허브 데이터 계약 테스트

**Files:**
- Modify: `tests/project-records.test.mjs`
- Modify: `tests/treasure-map.test.mjs`

- [ ] **Step 1: 신규 허브를 요구하는 실패 테스트 작성**
  - 7개 허브 ID·한글 라벨·고유 지도 좌표를 요구한다.
  - `materials`와 `work`에 운영 허브 kind와 연결 대기/임시 상태 문구가 있어야 한다.
- [ ] **Step 2: 테스트를 실행해 신규 데이터가 없어 실패하는지 확인**
  - Run: `node --test tests/project-records.test.mjs tests/treasure-map.test.mjs`
  - Expected: FAIL because only five map hubs exist.

### Task 2: 자료·작업 허브 구현

**Files:**
- Modify: `src/content.js`

- [ ] **Step 1: `materials` 허브와 문서 전시 데이터 추가**
  - 문서 보관함과 근거 아카이브를 임시 프로젝트 전시로 연결한다.
- [ ] **Step 2: `work` 허브와 AI 작업 본부 데이터 추가**
  - 작업 큐·에이전트 상태·개발 로그를 나중에 교체할 수 있는 임시 전시로 추가한다.
  - 실제 진행률이나 실행 사실은 확정하지 않고 `연결 대기`로 표시한다.
- [ ] **Step 3: 테스트 통과 확인**
  - Run: `node --test tests/project-records.test.mjs tests/treasure-map.test.mjs`
  - Expected: PASS.

### Task 3: 원본 보물지도 장식 밀도 보강

**Files:**
- Modify: `src/treasure-map.js`
- Modify: `src/styles.css`

- [ ] **Step 1: 신규 랜드마크 선화 추가**
  - `work`는 작업실/기어 계열, `materials`는 문서함/책 계열의 고유 실루엣을 사용한다.
- [ ] **Step 2: 배경 장식 레이어 추가**
  - 풍선, 등대, 성, 배, 산맥, 오두막, 표지판, 보석을 기존 양피지 팔레트로 추가한다.
  - 장식은 `aria-hidden` 비인터랙티브 SVG로 유지한다.
- [ ] **Step 3: 라벨·루트·반응형 스타일 조정**
  - 장식과 신규 허브 라벨이 겹치지 않게 좌표와 z-index를 조정한다.
  - 모바일에서도 지도 aspect ratio와 버튼 포커스를 유지한다.
- [ ] **Step 4: 정적 UI 테스트 통과**
  - Run: `node --test tests/*.mjs`
  - Expected: PASS.

### Task 4: 브라우저 검증 및 릴리스

**Files:**
- Modify: `README.md` only if the current hub list needs documentation.

- [ ] **Step 1: 로컬 브라우저에서 7개 랜드마크 확인**
  - 지도에 7개 라벨이 보이고 `자료`, `작업` 클릭이 각 섬으로 진입하는지 확인한다.
- [ ] **Step 2: 랜딩 디자인 품질 확인**
  - 원본 레퍼런스의 양피지·선화·풍선·등대·성·배·나침반 밀도와 비교한다.
- [ ] **Step 3: 전체 검증**
  - Run: `node --test tests/*.mjs`, `node --check src/app.js`, `node --check src/content.js`, `node --check src/treasure-map.js`, `git diff --check`
- [ ] **Step 4: 커밋과 push**
  - Commit: `feat: add work and materials map hubs`
  - Push: `origin feat/pixel-asset-system`
