# Dev Sky Archive / repository research

기준일: 2026-10-22  
대상 계정: `sunwoo162`  
목적: GitHub에 흩어진 레포를 게임의 하늘섬·프로젝트 전시 데이터로 바꾸기

## 조사 방식

각 레포에서 공개된 범위의 다음 정보를 읽어 정리했다.

- README와 프로젝트 설명
- `package.json`, `pyproject.toml`, `Cargo.toml`, `manifest.json` 등 실행·의존성 파일
- 루트 폴더 구조와 대표적인 소스 폴더
- 최근 커밋의 기능명과 수정 흐름
- 배포·테스트·안전 범위에 대한 문서

비밀번호, 토큰, `.env` 값 같은 비밀값은 읽거나 저장하지 않았다. 레포만으로 실제 담당 역할을 확정할 수 없는 경우에는 데이터에 `needs-confirmation`을 남겼다.

## 게임에 들어간 프로젝트 데이터

상세 데이터는 [`../data/project-records.json`](../data/project-records.json)에 저장되어 있고, 현재 UI용 전시 카탈로그는 [`../src/content.js`](../src/content.js)에 있다. 각 전시에는 다음 필드가 있다.

| 필드 | 의미 |
| --- | --- |
| `id`, `title`, `repo` | 게임에서 찾기 위한 식별자와 원본 레포 |
| `category`, `status`, `summary` | 어느 섬에 놓을지와 한 줄 설명 |
| `stack` | README·manifest·package 파일에서 확인한 기술 |
| `role` | 실제 담당 범위. 추정이면 확인 필요로 표시 |
| `developmentTimeline` / `timeline` | 문제 정의부터 최근 기능까지의 개발 흐름 |
| `evidence` / `detailSource` | 내용을 만들 때 확인한 근거 |
| `links` | GitHub·로컬 결과물·배포 주소 |

### 현재 게임 자체

`Dev Sky Archive`를 첫 번째 프로젝트로 등록했다. HTML/CSS/JavaScript, Canvas, Node test runner, Python HTTP server를 사용하고, 문제 정의 → 하늘섬 모델 → 플레이 가능 프로토타입 → 레포 데이터화의 흐름으로 기록한다.

### 프로필 코어 섬

- `Profile Core` — 프로젝트, 기술 스택, 역할, 자기소개 자료가 다른 섬으로 뻗어 나가는 중심 허브

### 개인 프로젝트 섬

- `Dev Sky Archive` — 이 포트폴리오 게임 자체
- `하루핏` — `100day`, 활동·목표·analytics·Electron 대시보드
- `MindTrace` — `ain`, AI 활동 그래프 탐색
- `ASMR Playground` — `ADHD`, 클릭·사운드 인터랙션 실험
- `Personalized LLM` — `eeee-personal-llm`, 로컬 LLM 평가·어댑터 registry

### 팀 프로젝트 섬

- `Washer Client v2` — Next.js/React 기반 세탁기 클라이언트
- `BloomBouquet` — `Playground`, 프로젝트 제출·평가 플랫폼
- `RepoDock` — `RD`, Rust 기반 안전한 저장소 동기화 도구
- `구조판 LAB` — `fire-evac-ai-hackathon`, 3D 화재·대피 시뮬레이션

### 대외활동 섬

- `NPC Platform` — `iseol-bot`, workspace·실행 기록·포트폴리오 플랫폼
- `WebBridge` — Chrome MV3 데이터 추출·변환·자동 입력 확장
- `FocusTime` — Chrome 확장·dashboard·GitHub Pages 배포
- `CodeReview-100` — Next.js/Prisma/PostgreSQL 학습 플랫폼
- `OSS Product Builder` — `EEEE`, 근거 기반 local-first workbench
- `gleave` — assistant·runtime·evidence verification 통합 플랫폼

### 스터디 섬

- `TIL` — React Native, 네트워크, FSD/FDA, Git 학습 메모
- `Restart TIL` — Cornell note, TanStack Query, HTTP, 도메인 모델
- `Coding-Test` — 백준·프로그래머스 풀이 저장소
- `Programmers Discord Bot` — commit 파싱·목표·streak 자동 알림
- `ClaimLatch` — claim/evidence 검증과 PASS/BLOCK release gate

## 전체 레포 인벤토리

총 35개를 계정 레포 인벤토리에 남겼다. 분류는 `candidate-project` 16개, `learning-log` 5개, `tooling` 5개, `profile-tooling` 1개, `empty-or-placeholder` 5개, `sandbox` 2개, `dependency-or-study` 1개다.

### 프로젝트 후보

`Washer-Client-v2`, `Playground`, `FocusTime`, `bobtory-demo`, `webbridge`, `EEEE`, `gleave`, `eeee-personal-llm`, `RD`, `CodeReview-100`, `fire-evac-ai-hackathon`, `iseol-bot`, `100day`, `claimlatch`, `ain`, `ADHD`

### 학습 기록

`TIL`, `Coding-Test`, `coding`, `class`, `Restart-TIL`

### 자동화·개발 도구

`webbridge`는 후보와 도구 양쪽 성격이 있어 프로젝트 섬에는 후보로 넣었다. 별도 도구성 레포는 `codingtestbot`, `ctbot`, `codex-harness-sync`, `test`, `iseol-live-smoke`다.

### 프로필·실험·비어 있는 레포

- 프로필: `sunwoo162`
- 샌드박스: `test23`, `google`
- 의존성·스터디: `axios`
- 비어 있거나 placeholder에 가까운 레포: `newcoding`, `G-`, `Java-study`, `-`, `rain`

## 역할 확인 큐

현재 레포 내용으로 프로젝트의 성격과 기술 흐름은 정리할 수 있지만, 팀 프로젝트에서 사용자가 실제로 맡은 범위까지는 모든 레포에서 확정할 수 없다. 그래서 다음 전시는 `내 역할`을 추정하지 않고 `기여 범위 확인 필요`로 보여준다.

`Washer Client v2`, `BloomBouquet`, `RepoDock`, `구조판 LAB`, `NPC Platform`, `WebBridge`, `FocusTime`, `CodeReview-100`, `OSS Product Builder`, `gleave`, `Personalized LLM`, `ClaimLatch`

이 목록은 나중에 사용자가 역할을 한 줄씩 확정하면 `needs-confirmation`을 `self-recorded`로 바꾸는 방식으로 업데이트한다.
