# Dev Sky Archive

블록 타일을 조립한 3D 하늘섬 월드맵에서 프로젝트 섬을 선택하고, 섬 안의 2D 탑다운 공간을 탐방하는 포트폴리오 게임 프로토타입입니다.

## 실행

정적 서버로 `outputs/dev-sky-archive` 폴더를 연 뒤 `http://localhost:4173/`에 접속합니다.

```powershell
py -m http.server 4173
```

## 현재 구현

- Three.js `PerspectiveCamera` 기반의 전방 관찰 시점 3D 하늘섬 선택 맵
- `PROFILE` 중앙 코어 섬에서 PERSONAL·TEAM·EXTERNAL·STUDY 작업 섬으로 이어지는 연결 경로
- 작업 분류 기준: PERSONAL PROJECTS·PROFILE·TEAM PROJECTS·EXTERNAL ACTIVITIES·STUDY ARCHIVE
- 잔디·흙·돌 블록을 한 칸씩 조립하는 모듈형 타일 지형
- 카테고리별 건물·나무·램프·구름을 코드 파츠로 합성하는 월드 에셋 구조
- WebGL/CDN 로드가 실패해도 DOM 버튼으로 계속 탐방할 수 있는 fallback
- 섬 클릭으로 2D 탑다운 프로젝트 월드 진입
- WASD/방향키 이동
- 프로젝트 표지판 클릭 또는 가까이에서 `E` 입력
- 프로젝트 전시 화면에서 역할, 기술 스택, 데이터 흐름, 개발 타임라인, 근거 확인
- 프로젝트마다 화면 캡처·시스템 구조·역할 증빙·README/배포·포트폴리오·자기소개서·프로젝트 설명·기타 자료를 넣을 8개 임시 슬롯
- `assets/` 아래 역할별로 분리한 오리지널 픽셀 SVG 에셋
- 에셋 카탈로그와 `assetId`를 통해 월드·타일·캐릭터·소품·UI·전시 그래픽을 교체 가능한 구조
- GitHub 레포 35개 인벤토리와 주요 프로젝트 21개 전시 데이터 포함
- `ARCHIVE INDEX`에서 GitHub 레포 35개를 카테고리별로 한 번에 확인

## 구조

- `index.html`: 세 화면의 기본 구조
- `asset-preview.html`: 3D 하늘섬 파츠와 전체 에셋 라이브러리를 확인하는 디자인 분해 보드
- `src/game-state.js`: 화면 전환 상태와 순수 함수
- `src/content.js`: 실제 레포 기반 섬·프로젝트 전시 데이터
- `src/app.js`: 렌더링, 입력, Canvas 맵, 상호작용
- `src/sky-3d.js`: 타일 블록·건물·소품을 조립하는 Three.js 3D 하늘맵
- `src/asset-catalog.js`: 에셋 ID, 경로, 대체 이미지, 접근성 텍스트를 관리하는 단일 카탈로그
- `src/styles.css`: 하늘맵, 2D 맵, 프로젝트 전시 스타일
- `assets/world/`: 3D 하늘섬 절벽 바닥·섬 표면·구름처럼 월드 전체에서 사용하는 그래픽
- `assets/tiles/`: 잔디·길·벽·물 패턴
- `assets/characters/`: 플레이어와 NPC 스프라이트
- `assets/props/`: 3D 하늘섬 건물·나무·램프와 2D 전시 키오스크·표지판
- `assets/ui/`: 커서와 공통 픽셀 프레임
- `assets/projects/`: 프로젝트 역할·화면·시스템·근거를 보여주는 전시 아트
- `data/project-records.json`: 기술 스택·역할·개발 과정·근거를 정규화한 원본 데이터
- `data/repo-inventory.json`: GitHub 계정의 35개 레포 1차 인벤토리
- `docs/repo-research.md`: 조사 방식, 프로젝트 분류, 역할 확인 큐
- `CONTRIBUTING.md`: 브랜치·커밋·PR·검증 규칙
- `.github/pull_request_template.md`: PR 체크리스트
- `tests/game-state.test.mjs`: 핵심 화면 전환 테스트
- `tests/project-records.test.mjs`: 데이터 필드·레포 인벤토리·UI 카탈로그 일치 테스트
- `tests/accessibility.test.mjs`: live region·reduced motion 접근성 테스트
- `tests/release-files.test.mjs`: 릴리즈 문서와 ignore 규칙 테스트
- `tests/asset-system.test.mjs`: 에셋 폴더·카탈로그·렌더러 연결 테스트

전시의 `자료 보관함`에 있는 `TEMP` 카드는 실제 자료를 넣기 전의 자리 표시자입니다. 각 카드의 화면 캡처, 문서, 링크, PDF, 발표 자료 영역을 실제 파일이나 URL로 교체하면 됩니다.

## 테스트

```powershell
node --test tests/*.mjs
```

## 배포

`main`에 반영되면 `.github/workflows/deploy-pages.yml`이 정적 사이트를 GitHub Pages로 배포합니다. PR과 `main` push에서는 `.github/workflows/ci.yml`이 테스트와 JavaScript 문법 검사를 실행합니다. 저장소 설정에서 Pages의 빌드 소스를 `GitHub Actions`로 선택한 뒤 사용할 수 있습니다.

3D 하늘맵은 `index.html`의 import map으로 고정한 Three.js ES module을 불러옵니다. 별도 번들러 없이 Pages에서 실행되도록 유지하고, `src/sky-3d.js`가 WebGL 장면·리사이즈·포인터 선택·reduced motion을 담당합니다. 실제 게임 화면의 탐방과 전시 데이터는 기존 `src/app.js`와 `data/`가 담당합니다.

새 에셋은 먼저 적절한 책임 폴더에 추가하고, `src/asset-catalog.js`에 고유한 `assetId`와 대체 텍스트를 등록합니다. 월드에서 쓰는 에셋은 원본 SVG 또는 교체 가능한 로컬 파일로만 관리하며, 화면 코드에 파일 경로를 직접 흩뿌리지 않습니다.

기여 규칙과 PR 작성 방식은 [`CONTRIBUTING.md`](./CONTRIBUTING.md)를 확인합니다.
