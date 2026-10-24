# 디자인 시스템 적용 기록

## 선택한 기준

`oh-my-design`의 디자인 시스템 아카이브에서 다음 두 기준을 골라 `Dev Sky Archive`의 인터페이스 레이어에만 적용했다.

- **Linear**: 어두운 캔버스, 좁은 명도 단계, 짧은 상태 라벨, 진행 상황을 한눈에 읽게 만드는 작업면.
- **Palantir Blueprint**: 문서·인덱스·목록을 위한 조밀한 정보 구조, 4/8/12/16/20px 간격, 작은 반경의 명확한 컨테이너.

보물지도, 지도 위의 손그림, 픽셀 에셋은 프로젝트 고유 세계관이므로 교체하지 않았다. 디자인 시스템은 지도와 충돌하지 않는 항해 로그, 프로젝트 인덱스, 전시 문서 화면의 UI 규칙으로만 사용한다.

## 코드 매핑

| 역할 | 적용 위치 | 적용한 규칙 |
| --- | --- | --- |
| navigation | 상단 상태 바 | 어두운 캔버스, 낮은 대비의 구분선, pill 상태 표시 |
| status-surface | 최단 경로 항해 화면 | 현재 상태·경로·진행률을 분리한 작업면 |
| index | 섬 우측 프로젝트 목록 | compact card, 명확한 hover/focus, 정보 우선 계층 |
| dossier | 프로젝트 전시 화면 | 인덱스/태그/CTA를 구분한 문서형 구조 |

## 토큰

`src/styles.css`의 `--ui-*` 토큰은 원본 브랜드를 복사한 값이 아니라, 위 원칙을 이 프로젝트의 네이비·금색·양피지 팔레트에 맞춰 변환한 값이다.

- `--ui-canvas`, `--ui-foreground`, `--ui-muted`, `--ui-hairline`: 작업면 명도 계층
- `--ui-space-xs` ~ `--ui-space-xl`: 조밀한 문서/인덱스 간격
- `--ui-control-radius`, `--ui-card-radius`: 작은 컨트롤과 문서 카드의 구분
- `--ui-card-shadow`: 카드가 떠 보이기보다 경계가 읽히는 낮은 elevation

## 에셋·라이선스 경계

이번 링크는 이미지 에셋 마켓이 아니라 실제 제품의 `DESIGN.md`를 정리한 아카이브다. 따라서 외부 브랜드의 로고·폰트 파일·일러스트를 프로젝트에 복사하지 않고, 공개된 디자인 원칙과 측정된 UI 구조만 참고했다. 지도와 픽셀 에셋은 현재 레포의 로컬 에셋을 계속 사용한다.

참고:

- https://oh-my-design.kr/design-systems/linear.app
- https://oh-my-design.kr/design-systems/palantir
