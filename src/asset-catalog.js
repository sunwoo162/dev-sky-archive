const asset = (category, file, alt) => ({
  category,
  path: `../assets/${category}/${file}.svg`,
  alt,
});

export const assetCatalog = Object.freeze({
  'island-personal': asset('world', 'island-personal', '개인 프로젝트 하늘섬'),
  'island-team': asset('world', 'island-team', '팀 프로젝트 하늘섬'),
  'island-frontend': asset('world', 'island-frontend', '프론트엔드 실험 하늘섬'),
  'island-til': asset('world', 'island-til', 'TIL 라이브러리 하늘섬'),
  'island-bed': asset('world', 'sky-island-bed', '3D 하늘섬 절벽 바닥'),
  'island-top-personal': asset('world', 'island-top-personal', '개인 프로젝트 섬 표면'),
  'island-top-team': asset('world', 'island-top-team', '팀 프로젝트 섬 표면'),
  'island-top-frontend': asset('world', 'island-top-frontend', '프론트엔드 실험 섬 표면'),
  'island-top-til': asset('world', 'island-top-til', 'TIL 라이브러리 섬 표면'),
  'island-top-profile': asset('world', 'island-top-profile', '프로필 코어 섬 표면'),
  'island-top-external': asset('world', 'island-top-external', '대외활동 섬 표면'),
  'island-top-study': asset('world', 'island-top-study', '스터디 섬 표면'),
  'cloud-pixel': asset('world', 'cloud-pixel', '픽셀 구름'),
  grass: asset('tiles', 'grass', '잔디 타일'),
  path: asset('tiles', 'path', '흙길 타일'),
  water: asset('tiles', 'water', '물 타일'),
  wall: asset('tiles', 'wall', '돌벽 타일'),
  player: asset('characters', 'player', '플레이어 캐릭터'),
  'archive-npc': asset('characters', 'archive-npc', '아카이브 안내 NPC'),
  'archive-hall': asset('props', 'archive-hall', '아카이브 홀 건물'),
  'project-kiosk': asset('props', 'project-kiosk', '프로젝트 전시 키오스크'),
  signpost: asset('props', 'signpost', '프로젝트 안내 표지판'),
  'sky-archive-tower': asset('props', 'sky-archive-tower', '개인 프로젝트 섬 타워'),
  'sky-team-lab': asset('props', 'sky-team-lab', '팀 프로젝트 섬 랩'),
  'sky-frontend-node': asset('props', 'sky-frontend-node', '프론트엔드 섬 노드'),
  'sky-til-library': asset('props', 'sky-til-library', 'TIL 섬 라이브러리'),
  'sky-profile-core': asset('props', 'sky-profile-core', '프로필 코어 중앙 건물'),
  'sky-external-gateway': asset('props', 'sky-external-gateway', '대외활동 게이트웨이'),
  'sky-study-library': asset('props', 'sky-study-library', '스터디 라이브러리'),
  'sky-tree': asset('props', 'sky-tree', '하늘섬 픽셀 나무'),
  'sky-lamp': asset('props', 'sky-lamp', '하늘섬 픽셀 램프'),
  'cursor-open': asset('ui', 'cursor-open', '열기 커서'),
  'pixel-frame': asset('ui', 'pixel-frame', '픽셀 프레임'),
  'selection-ring': asset('ui', 'selection-ring', '섬 선택 링'),
  '3d-compass': asset('ui', '3d-compass', '3D 하늘맵 방향 나침반'),
  'project-screen': asset('projects', 'project-screen', '프로젝트 화면 자료'),
  'project-system': asset('projects', 'project-system', '프로젝트 시스템 구조 자료'),
  'project-role': asset('projects', 'project-role', '프로젝트 역할 증빙 자료'),
  'project-evidence': asset('projects', 'project-evidence', '프로젝트 배포 및 근거 자료'),
});

export const assetIds = Object.freeze(Object.keys(assetCatalog));

export function assetUrl(id) {
  return assetCatalog[id]?.path ?? assetCatalog['pixel-frame'].path;
}
