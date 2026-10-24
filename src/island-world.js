export const WORLD_SIZE = Object.freeze({ width: 2400, height: 1600 });
export const HARBOR_START = Object.freeze({ x: 1200, y: 1320 });
export const MUSEUM_DOOR = Object.freeze({ x: 1200, y: 300 });

const EXTERIOR_PROJECT_POSITIONS = [
  { x: 520, y: 570 },
  { x: 1880, y: 570 },
  { x: 520, y: 840 },
  { x: 1880, y: 840 },
  { x: 1200, y: 820 },
];

export function createIslandWorld(island = {}) {
  const projects = (island.projects ?? []).map((project, index) => ({
    ...project,
    ...EXTERIOR_PROJECT_POSITIONS[index % EXTERIOR_PROJECT_POSITIONS.length],
  }));

  return {
    id: island.id ?? 'island',
    title: island.title ?? '프로젝트 박물관',
    color: island.color ?? '#ff9b71',
    start: { ...HARBOR_START },
    museum: {
      door: { ...MUSEUM_DOOR },
      x: 1200,
      y: 150,
      width: 560,
      height: 360,
    },
    projects,
  };
}

export function createMuseumLayout(projects = []) {
  const positions = [
    { x: 420, y: 760 },
    { x: 1200, y: 760 },
    { x: 1980, y: 760 },
    { x: 780, y: 1110 },
    { x: 1620, y: 1110 },
  ];

  return projects.map((project, index) => ({
    ...project,
    ...(positions[index % positions.length]),
  }));
}

export function findNearestExhibit(player, exhibits = [], radius = 110) {
  let nearest = null;
  for (const exhibit of exhibits) {
    const distance = Math.hypot(player.x - exhibit.x, player.y - exhibit.y);
    if (distance <= radius && (!nearest || distance < nearest.distance)) {
      nearest = { ...exhibit, distance };
    }
  }
  return nearest;
}

export function getCamera(player, viewport, world = WORLD_SIZE) {
  const maxX = Math.max(0, world.width - viewport.width);
  const maxY = Math.max(0, world.height - viewport.height);
  return {
    x: Math.max(0, Math.min(maxX, player.x - viewport.width / 2)),
    y: Math.max(0, Math.min(maxY, player.y - viewport.height / 2)),
  };
}

export function isAtMuseumDoor(player, door = MUSEUM_DOOR, radius = 76) {
  return Math.hypot(player.x - door.x, player.y - door.y) <= radius;
}
