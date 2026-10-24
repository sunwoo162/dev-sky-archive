const asset = (category, file, alt) => ({
  category,
  path: `../assets/${category}/${file}.svg`,
  alt,
});

export const assetCatalog = Object.freeze({
  grass: asset('tiles', 'grass', '잔디 타일'),
  path: asset('tiles', 'path', '흙길 타일'),
  water: asset('tiles', 'water', '물 타일'),
  wall: asset('tiles', 'wall', '돌벽 타일'),
  player: asset('characters', 'player', '플레이어 캐릭터'),
  'archive-npc': asset('characters', 'archive-npc', '아카이브 안내 NPC'),
  'archive-hall': asset('props', 'archive-hall', '아카이브 홀 건물'),
  'museum-grand': asset('props', 'museum-grand', '대형 프로젝트 박물관'),
  'harbor-dock': asset('props', 'harbor-dock', '항구 선착장'),
  'harbor-boat': asset('props', 'harbor-boat', '항구 배'),
  'museum-exhibit': asset('props', 'museum-exhibit', '박물관 전시대'),
  'museum-pillar': asset('props', 'museum-pillar', '박물관 기둥'),
  'museum-banner': asset('props', 'museum-banner', '박물관 중앙 배너'),
  'museum-lamp': asset('props', 'museum-lamp', '박물관 샹들리에'),
  'sky-tree': asset('props', 'sky-tree', '월드 나무'),
  'sky-lamp': asset('props', 'sky-lamp', '월드 가로등'),
  'project-kiosk': asset('props', 'project-kiosk', '프로젝트 전시 키오스크'),
  signpost: asset('props', 'signpost', '프로젝트 안내 표지판'),
  'cursor-open': asset('ui', 'cursor-open', '열기 커서'),
  'pixel-frame': asset('ui', 'pixel-frame', '픽셀 프레임'),
  'project-screen': asset('projects', 'project-screen', '프로젝트 화면 자료'),
  'project-system': asset('projects', 'project-system', '프로젝트 시스템 구조 자료'),
  'project-role': asset('projects', 'project-role', '프로젝트 역할 증빙 자료'),
  'project-evidence': asset('projects', 'project-evidence', '프로젝트 배포 및 근거 자료'),
});

export const assetIds = Object.freeze(Object.keys(assetCatalog));

export function assetUrl(id) {
  return assetCatalog[id]?.path ?? assetCatalog['pixel-frame'].path;
}
