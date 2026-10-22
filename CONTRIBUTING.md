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

## 로컬 검증

```powershell
node --test tests/*.mjs
node --check src/app.js
node --check src/content.js
node --check src/game-state.js
py -m http.server 4173
```

브라우저에서 `sky → island → project exhibit → ESC` 흐름, WASD 이동, Archive Index 35개 레포 목록, GitHub 링크를 확인합니다. 화면을 바꾼 경우 데스크톱과 좁은 화면에서 레이아웃도 확인합니다.

## Pull Request

PR 제목에도 Conventional Commits 형식을 사용합니다. PR 본문에는 변경 요약, 실행한 테스트, 브라우저 QA, 데이터·역할 확인 여부, 필요한 스크린샷을 남깁니다. 템플릿의 체크리스트를 모두 확인한 뒤 리뷰를 요청합니다.

현재 프로젝트에는 연결된 GitHub 원격 레포가 없으므로, 원격 주소를 확인한 뒤에만 push와 PR을 생성합니다.
