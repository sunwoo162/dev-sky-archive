export function createInitialState() {
  return { screen: 'sky', islandId: null, projectId: null };
}

export function enterIsland(state, islandId) {
  return { screen: 'island', islandId, projectId: null };
}

export function openProject(state, projectId) {
  if (state.screen !== 'island') return state;
  return { screen: 'project', islandId: state.islandId, projectId };
}

export function closeProject(state) {
  if (state.screen !== 'project') return state;
  return { screen: 'island', islandId: state.islandId, projectId: null };
}

export function exitToSky() {
  return createInitialState();
}
