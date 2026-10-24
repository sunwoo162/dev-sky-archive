export const TRAVEL_GRAPH = Object.freeze({
  profile: Object.freeze(['personal', 'external', 'study', 'work']),
  personal: Object.freeze(['profile', 'team']),
  team: Object.freeze(['personal', 'materials']),
  external: Object.freeze(['profile', 'study']),
  study: Object.freeze(['external', 'profile', 'materials', 'work']),
  materials: Object.freeze(['team', 'study', 'work']),
  work: Object.freeze(['profile', 'materials', 'study']),
});

export function findShortestPath(startId, destinationId, graph = TRAVEL_GRAPH) {
  if (!startId || !destinationId || !graph[startId] || !graph[destinationId]) return [];
  if (startId === destinationId) return [startId];

  const queue = [startId];
  const visited = new Set([startId]);
  const previous = new Map();

  while (queue.length) {
    const current = queue.shift();
    for (const neighbor of graph[current] ?? []) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      previous.set(neighbor, current);
      if (neighbor === destinationId) {
        const path = [destinationId];
        let cursor = destinationId;
        while (previous.has(cursor)) {
          cursor = previous.get(cursor);
          path.unshift(cursor);
        }
        return path;
      }
      queue.push(neighbor);
    }
  }

  return [];
}

export function getTravelDuration(path, { minimum = 1800, perExtraHop = 900, maximum = 6500 } = {}) {
  const hops = Math.max(0, path.length - 1);
  if (!hops) return 0;
  return Math.min(maximum, minimum + Math.max(0, hops - 1) * perExtraHop);
}

export function getTravelTip(island) {
  if (!island) return '';
  const source = island.projects?.length === 1 ? island.projects[0]?.summary : island.description;
  return String(source ?? '').replace(/\s+/g, ' ').trim();
}
