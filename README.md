# Dev Sky Archive

오래된 보물지도에서 프로젝트 랜드마크를 선택하고, 카테고리별 2D 탑다운 공간을 탐방하는 포트폴리오 게임 프로토타입입니다.

## 실행

정적 서버로 `outputs/dev-sky-archive` 폴더를 연 뒤 `http://localhost:4173/`에 접속합니다.

```powershell
py -m http.server 4173
```

## 현재 구현

- SVG 양피지 위에 대륙·산맥·열기구·등대·성·배·나침반을 직접 그린 보물지도 일러스트를 첫 화면으로 사용
- 보물지도 위에 `프로필`·개인 프로젝트·팀 프로젝트·대외활동·스터디와 운영 허브 `자료`·`작업` 랜드마크를 배치
- 랜드마크 사이의 점선 경로와 카테고리별 고유 건물 실루엣으로 탐방 관계를 시각화
- 작업 분류 기준: 프로필·개인 프로젝트·팀 프로젝트·대외활동·스터디
- 운영 허브: `자료`는 문서·근거 보관, `작업`은 향후 AI 작업자와 개발 진행을 연결할 자리이며 현재는 연결 대기 상태
- 카테고리마다 실루엣이 다른 지도 랜드마크: 프로필 허브·개인 작업실·팀 본부·대외활동 관문·스터디 도서관
- 지도 배경은 인라인 SVG, 선택 컨트롤은 접근 가능한 HTML 버튼으로 분리
- 섬 클릭으로 2D 탑다운 프로젝트 박물관 월드 진입
- 항구에서 시작해 박물관까지 WASD/방향키로 이동, 박물관 안에서 가까운 전시관을 `J` 도슨트 설명으로 확인, `E` 전체 전시
- 전시관 클릭도 같은 도슨트 모달을 열고, 모달에서 프로젝트 웹 전시로 연결
- 프로젝트 표지판 클릭 또는 가까이에서 `E` 입력
- 프로젝트 전시 화면에서 역할, 기술 스택, 데이터 흐름, 개발 타임라인, 근거 확인
- 프로젝트마다 화면 캡처·시스템 구조·역할 증빙·README/배포·포트폴리오·자기소개서·프로젝트 설명·기타 자료를 넣을 8개 임시 슬롯
- `assets/` 아래 역할별로 분리한 오리지널 픽셀 SVG 에셋
- 에셋 카탈로그와 `assetId`를 통해 월드·타일·캐릭터·소품·UI·전시 그래픽을 교체 가능한 구조
- GitHub 레포 35개 인벤토리와 주요 프로젝트 21개 전시 데이터 포함
- `ARCHIVE INDEX`에서 GitHub 레포 35개를 카테고리별로 한 번에 확인

## 구조

- `index.html`: 세 화면의 기본 구조
- `asset-preview.html`: 기존 픽셀 에셋 파츠와 전체 에셋 라이브러리를 확인하는 디자인 분해 보드
- `src/game-state.js`: 화면 전환 상태와 순수 함수
- `src/content.js`: 실제 레포 기반 섬·프로젝트 전시 데이터
- `src/museum.js`: 프로젝트 기록을 박물관 도슨트용 프론트엔드 필드 노트로 변환
- `src/app.js`: 렌더링, 입력, Canvas 맵, 상호작용
- `src/treasure-map.js`: 양피지 지도·경로·랜드마크·나침반을 조합하는 SVG 첫 화면
- `src/asset-catalog.js`: 에셋 ID, 경로, 대체 이미지, 접근성 텍스트를 관리하는 단일 카탈로그
- `src/styles.css`: 하늘맵, 2D 맵, 프로젝트 전시 스타일
- `assets/world/`: 상세 2D 월드와 레거시 하늘섬 조합에서 사용하는 그래픽
- `assets/maps/treasure-map-etched.png`: 첫 화면에 사용하는 고밀도 잉크 보물지도 원본 에셋
- `assets/tiles/`: 잔디·길·벽·물 패턴
- `assets/characters/`: 플레이어와 NPC 스프라이트
- `assets/props/`: 2D 탐방 월드의 아카이브 홀·키오스크·표지판
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

첫 화면은 외부 렌더러 없이 `src/treasure-map.js`가 인라인 SVG와 HTML 버튼을 조합합니다. 별도 번들러 없이 Pages에서 실행되며, 실제 게임 화면의 탐방과 전시 데이터는 기존 `src/app.js`와 `data/`가 담당합니다. 카테고리를 선택하면 Canvas 2D 프로젝트 박물관으로 들어가 WASD/방향키로 이동하고, 전시관 근처에서 J를 눌러 프론트엔드 필드 노트를 읽거나 E로 전체 프로젝트 전시를 엽니다. 전시관을 직접 클릭해도 같은 도슨트 모달이 열립니다.

새 에셋은 먼저 적절한 책임 폴더에 추가하고, `src/asset-catalog.js`에 고유한 `assetId`와 대체 텍스트를 등록합니다. 월드에서 쓰는 에셋은 원본 SVG 또는 교체 가능한 로컬 파일로만 관리하며, 화면 코드에 파일 경로를 직접 흩뿌리지 않습니다.

기여 규칙과 PR 작성 방식은 [`CONTRIBUTING.md`](./CONTRIBUTING.md)를 확인합니다.
