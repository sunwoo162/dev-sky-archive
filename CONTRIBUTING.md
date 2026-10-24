# Contributing to Dev Sky Archive

이 레포는 포트폴리오 게임의 코드와 프로젝트 기록을 함께 관리합니다. 기능을 추가할 때는 플레이 경험과 데이터의 근거가 함께 남아야 합니다.

## 브랜치와 커밋

- 기능: `feat/<topic>`
- 버그 수정: `fix/<topic>`
- 문서·데이터 정리: `docs/<topic>` 또는 `chore/<topic>`
- 커밋 메시지는 Conventional Commits를 사용합니다: `feat:`, `fix:`, `test:`, `docs:`, `chore:`
- 한 커밋은 하나의 의도만 담고, 생성물·비밀키·개인 토큰은 커밋하지 않습니다.

## 데이터 원칙

- `data/project-records.json`의 역할과 기여도는 확인된 사실만 적습니다.
- 확인되지 않은 역할은 `needs-confirmation`으로 남기고 임의로 확정하지 않습니다.
- 새 프로젝트를 추가할 때 GitHub 레포 링크, 기술 스택, 작업 기록, 근거를 함께 갱신합니다.

## 디자인 에셋

- 에셋은 역할별 폴더에 둡니다: `assets/world`, `tiles`, `characters`, `props`, `ui`, `projects`.
- 화면 코드에는 파일 경로를 직접 넣지 않고 `src/asset-catalog.js`에 `assetId`, 경로, 대체 텍스트를 등록합니다.
- 기본 에셋은 로컬 오리지널 SVG를 사용합니다. 외부 게임의 스프라이트·UI·아이콘을 복사하지 않습니다.
- 픽셀 에셋은 `shape-rendering="crispEdges"`를 유지하고, 실제 스프라이트로 교체할 때도 기존 `assetId`를 우선 보존합니다.
- 첫 화면의 지도는 `src/treasure-map.js`에서 종이·해안선·경로·랜드마크를 SVG 레이어로 조합합니다. 카테고리 좌표와 라벨은 `src/content.js`에서 관리합니다.
- 프로젝트 내용·역할·레포 정보는 `data/project-records.json`과 `src/content.js`에서 관리하고, 지도 렌더러에는 사실 데이터를 하드코딩하지 않습니다.
- 외부 게임의 스프라이트를 복제하지 않고, 단순한 기하와 로컬 에셋으로 같은 장르의 모듈형 게임 문법만 구현합니다.

## 로컬 검증

```powershell
node --test tests/*.mjs
node --check src/app.js
node --check src/content.js
node --check src/asset-catalog.js
node --check src/game-state.js
node --check src/treasure-map.js
git diff --check
py -m http.server 4173
```

브라우저에서 `treasure map → island museum → J 도슨트 → E project exhibit → ESC` 흐름, 랜드마크 keyboard focus, WASD 이동, 전시관 클릭 모달, Archive Index 35개 레포 목록, GitHub 링크를 확인합니다. 화면을 바꾼 경우 데스크톱과 좁은 화면에서 레이아웃도 확인합니다.

## Pull Request

PR 제목에도 Conventional Commits 형식을 사용합니다. PR 본문에는 변경 요약, 실행한 테스트, 브라우저 QA, 데이터·역할 확인 여부, 필요한 스크린샷을 남깁니다. 템플릿의 체크리스트를 모두 확인한 뒤 리뷰를 요청합니다.

push와 PR을 만들기 전 `git remote -v`로 대상 원격을 확인합니다. 현재 기본 원격은 `https://github.com/sunwoo162/dev-sky-archive`입니다.
