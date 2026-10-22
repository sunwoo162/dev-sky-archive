# Dev Sky Archive

3D 하늘섬 월드맵에서 프로젝트 섬을 선택하고, 섬 안의 2D 탑다운 공간을 탐방하는 포트폴리오 게임 프로토타입입니다.

## 실행

정적 서버로 `outputs/dev-sky-archive` 폴더를 연 뒤 `http://localhost:4173/`에 접속합니다.

```powershell
py -m http.server 4173
```

## 현재 구현

- 3D처럼 보이는 하늘섬 선택 맵
- 섬 클릭으로 2D 탑다운 프로젝트 월드 진입
- WASD/방향키 이동
- 프로젝트 표지판 클릭 또는 가까이에서 `E` 입력
- 프로젝트 전시 화면에서 역할, 기술 스택, 데이터 흐름, 개발 타임라인, 근거 확인
- 외부 이미지 없이 CSS·Canvas·DOM으로 제작한 비주얼
- GitHub 레포 35개 인벤토리와 주요 프로젝트 20개 전시 데이터 포함
- `ARCHIVE INDEX`에서 GitHub 레포 35개를 카테고리별로 한 번에 확인

## 구조

- `index.html`: 세 화면의 기본 구조
- `src/game-state.js`: 화면 전환 상태와 순수 함수
- `src/content.js`: 실제 레포 기반 섬·프로젝트 전시 데이터
- `src/app.js`: 렌더링, 입력, Canvas 맵, 상호작용
- `src/styles.css`: 하늘맵, 2D 맵, 프로젝트 전시 스타일
- `data/project-records.json`: 기술 스택·역할·개발 과정·근거를 정규화한 원본 데이터
- `data/repo-inventory.json`: GitHub 계정의 35개 레포 1차 인벤토리
- `docs/repo-research.md`: 조사 방식, 프로젝트 분류, 역할 확인 큐
- `CONTRIBUTING.md`: 브랜치·커밋·PR·검증 규칙
- `.github/pull_request_template.md`: PR 체크리스트
- `tests/game-state.test.mjs`: 핵심 화면 전환 테스트
- `tests/project-records.test.mjs`: 데이터 필드·레포 인벤토리·UI 카탈로그 일치 테스트
- `tests/accessibility.test.mjs`: live region·reduced motion 접근성 테스트
- `tests/release-files.test.mjs`: 릴리즈 문서와 ignore 규칙 테스트

## 테스트

```powershell
node --test tests/*.mjs
```

기여 규칙과 PR 작성 방식은 [`CONTRIBUTING.md`](./CONTRIBUTING.md)를 확인합니다.
