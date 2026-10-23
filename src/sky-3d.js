import * as THREE from 'three';

const TILE = 1;
const COLORS = Object.freeze({
  grass: 0x9bcf79,
  grassLight: 0xc1df8f,
  soil: 0x9c775d,
  stone: 0x5b6578,
  stoneDark: 0x354054,
  path: 0xe2c886,
  cream: 0xfff0bb,
  navy: 0x27364a,
  tree: 0x5e9a69,
  treeDark: 0x35644e,
  coral: 0xed9472,
  blue: 0x7ea7d0,
  violet: 0x9b8be7,
  mint: 0x8ec5ad,
  sky: 0xc9e7f3,
  cloud: 0xfff4df,
});

const ISLAND_LAYOUTS = Object.freeze({
  profile: {
    position: [0, -0.55], rotation: 0.02, elevation: 0.62,
    palette: { top: 0xe0ba69, roof: 0x756581 }, building: 'profile',
    cells: [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1], [0, -2], [0, 2]],
    props: [[-1.18, 0.18, 0.44, 0.58], [1.18, 0.18, -0.5, 0.58], [1.25, 0.18, 0.46]],
  },
  personal: {
    position: [-6.1, 2.8], rotation: -0.12, elevation: 0.08,
    palette: { top: COLORS.grass, roof: COLORS.coral }, building: 'archive',
    cells: [[-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1]],
    props: [[-1.35, 0.18, 0.4, 0.72], [1.35, 0.18, -0.56, 0.58], [1.5, 0.18, 0.52]],
  },
  team: {
    position: [6.1, 2.75], rotation: 0.16, elevation: 0.3,
    palette: { top: COLORS.blue, roof: 0x6d8ed0 }, building: 'team',
    cells: [[-1, -2], [0, -2], [1, -2], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1]],
    props: [[-1.42, 0.18, 0.5, 0.62], [1.35, 0.18, -0.8, 0.7], [1.55, 0.18, 0.48]],
  },
  external: {
    position: [-5.7, -3.75], rotation: 0.34, elevation: 0.82,
    palette: { top: 0x87b5c2, roof: 0x5d8ca1 }, building: 'external',
    cells: [[-2, -1], [-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1]],
    props: [[-1.42, 0.18, 0.42, 0.76], [1.55, 0.18, -0.62, 0.55], [1.42, 0.18, 0.5]],
  },
  study: {
    position: [5.7, -3.95], rotation: -0.26, elevation: 0.14,
    palette: { top: 0xa8bf8b, roof: 0x7b7554 }, building: 'study',
    cells: [[-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-2, 1], [-1, 1], [0, 1], [1, 1]],
    props: [[-1.4, 0.18, 0.38, 0.64], [1.45, 0.18, -0.7, 0.68], [1.46, 0.18, 0.5]],
  },
});

function material(color, extra = {}) {
  return new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra });
}

function createBlock({ top = COLORS.grass, side = COLORS.soil, bottom = COLORS.stoneDark, height = 0.42 } = {}) {
  const geometry = new THREE.BoxGeometry(TILE * 0.96, height, TILE * 0.96);
  const materials = [
    material(side), material(side), material(top), material(bottom), material(side), material(side),
  ];
  return new THREE.Mesh(geometry, materials);
}

function createIslandTerrain(island) {
  const config = ISLAND_LAYOUTS[island.id] ?? ISLAND_LAYOUTS.personal;
  const group = new THREE.Group();
  const cells = config.cells;

  cells.forEach(([x, z], index) => {
    const top = createBlock({ top: config.palette.top, side: COLORS.soil, bottom: COLORS.stoneDark, height: 0.42 });
    top.position.set(x * TILE, 0, z * TILE);
    group.add(top);

    const lower = createBlock({ top: COLORS.stone, side: COLORS.stoneDark, bottom: COLORS.stoneDark, height: 0.42 });
    lower.position.set(x * TILE, -0.42, z * TILE);
    group.add(lower);

    if (index % 3 !== 1) {
      const under = createBlock({ top: COLORS.stoneDark, side: COLORS.stoneDark, bottom: COLORS.stoneDark, height: 0.42 });
      under.scale.set(.86, 1, .86);
      under.position.set(x * TILE, -0.84, z * TILE);
      group.add(under);
    }
  });

  return { group, config };
}

function createBuilding(type, roofColor) {
  const group = new THREE.Group();
  const profiles = {
    profile: { body: [1.65, 0.98, 1.48], roof: [1.3, 0.52], y: 0.66 },
    archive: { body: [1.55, 0.92, 1.22], roof: [1.12, 0.52], y: 0.63 },
    team: { body: [1.15, 1.3, 1.05], roof: [0.92, 0.42], y: 0.82 },
    external: { body: [1.5, 0.82, 1.08], roof: [1.24, 0.28], y: 0.58 },
    study: { body: [0.94, 1.5, 0.94], roof: [0.76, 0.42], y: 0.94 },
  };
  const profile = profiles[type] ?? profiles.archive;
  const bodyPalettes = {
    profile: [0x756581, 0x5d4f6f, 0xf6d47b, 0x4b415f, 0x9b86aa, 0x4b415f],
    archive: [0x8395a4, 0x738798, 0xf1d79a, 0x5a6a7c, 0x8799a7, 0x6a7a8b],
    team: [0x71869a, 0x5b6d83, 0xc6d9ec, 0x46566b, 0x879db1, 0x53667c],
    external: [0x5d8190, 0x4b6c80, 0xd4e7d0, 0x3d566d, 0x83a8aa, 0x445c70],
    study: [0x68776b, 0x536258, 0xf0dda0, 0x414d4b, 0x97a987, 0x4e5b58],
  };
  const body = new THREE.Mesh(new THREE.BoxGeometry(...profile.body), (bodyPalettes[type] ?? bodyPalettes.archive).map((color) => material(color)));
  body.position.y = profile.y;
  group.add(body);

  const roofSides = type === 'team' || type === 'study' ? 4 : type === 'profile' ? 6 : 5;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(profile.roof[0], profile.roof[1], roofSides), material(roofColor));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = profile.y + profile.body[1] / 2 + profile.roof[1] / 2;
  group.add(roof);

  if (type === 'external') {
    const gateMaterial = material(COLORS.cream, { emissive: COLORS.cream, emissiveIntensity: .16 });
    [-.62, .62].forEach((x) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(.18, 1.1, .18), gateMaterial);
      pillar.position.set(x, .82, .62);
      group.add(pillar);
    });
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.42, .18, .18), gateMaterial);
    lintel.position.set(0, 1.32, .62);
    group.add(lintel);
    const node = new THREE.Mesh(new THREE.OctahedronGeometry(.22, 0), material(COLORS.mint, { emissive: COLORS.mint, emissiveIntensity: .38 }));
    node.position.set(0, 1.72, .62);
    group.add(node);
  }

  if (type === 'study') {
    const bookColors = [COLORS.coral, COLORS.path, COLORS.mint];
    bookColors.forEach((color, index) => {
      const book = new THREE.Mesh(new THREE.BoxGeometry(.8 - index * .08, .12, .62), material(color));
      book.position.set(0, 1.72 + index * .15, .02);
      book.rotation.y = index % 2 ? .16 : -.1;
      group.add(book);
    });
    const bookmark = new THREE.Mesh(new THREE.BoxGeometry(.08, .58, .08), material(COLORS.coral));
    bookmark.position.set(.26, 1.98, .05);
    group.add(bookmark);
  }

  if (type === 'archive') {
    const antenna = new THREE.Mesh(new THREE.BoxGeometry(.12, .62, .12), material(COLORS.coral));
    antenna.position.set(0, 1.54, -.06);
    group.add(antenna);
    const archiveFlag = new THREE.Mesh(new THREE.BoxGeometry(.54, .22, .05), material(COLORS.cream));
    archiveFlag.position.set(.25, 1.72, .64);
    group.add(archiveFlag);
  }

  if (type === 'team') {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(.54, .7, .64), material(0x6d7d90));
    wing.position.set(.72, .5, -.08);
    group.add(wing);
    const secondWing = new THREE.Mesh(new THREE.BoxGeometry(.54, .58, .72), material(0x526a83));
    secondWing.position.set(-.72, .43, .1);
    group.add(secondWing);
    const teamDeck = new THREE.Mesh(new THREE.BoxGeometry(1.72, .12, .72), material(COLORS.blue));
    teamDeck.position.set(0, 1.5, -.08);
    group.add(teamDeck);
  }
  if (type === 'profile') {
    const core = new THREE.Mesh(new THREE.BoxGeometry(.42, .56, .42), material(COLORS.cream, { emissive: COLORS.cream, emissiveIntensity: .22 }));
    core.position.y = 1.55;
    group.add(core);
    const coreCap = new THREE.Mesh(new THREE.OctahedronGeometry(.26, 0), material(COLORS.coral, { emissive: COLORS.coral, emissiveIntensity: .35 }));
    coreCap.position.y = 1.98;
    group.add(coreCap);
    [-.65, .65].forEach((x) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(.16, .62, .16), material(COLORS.path));
      pillar.position.set(x, .96, .62);
      group.add(pillar);
    });
  }

  const door = new THREE.Mesh(new THREE.BoxGeometry(.26, .46, .03), material(COLORS.navy));
  door.position.set(0, Math.max(.44, profile.y - .12), profile.body[2] / 2 + .02);
  group.add(door);

  const windowMaterial = material(COLORS.cream, { emissive: COLORS.cream, emissiveIntensity: .18 });
  [-.4, .4].forEach((x) => {
    const window = new THREE.Mesh(new THREE.BoxGeometry(.19, .2, .03), windowMaterial);
    window.position.set(x * Math.min(1, profile.body[0] / 1.28), profile.y + .16, profile.body[2] / 2 + .02);
    group.add(window);
  });
  return group;
}

function createTree() {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(.16, .55, .16), material(0x765341));
  trunk.position.y = .35;
  group.add(trunk);
  const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(.46, 0), material(COLORS.tree));
  crown.position.y = .9;
  group.add(crown);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.42, 6), material(COLORS.treeDark));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = .03;
  group.add(shadow);
  return group;
}

function createLamp() {
  const group = new THREE.Group();
  const post = new THREE.Mesh(new THREE.BoxGeometry(.1, .58, .1), material(COLORS.navy));
  post.position.y = .35;
  group.add(post);
  const light = new THREE.Mesh(new THREE.BoxGeometry(.25, .25, .25), material(COLORS.cream, { emissive: COLORS.cream, emissiveIntensity: .4 }));
  light.position.y = .72;
  group.add(light);
  return group;
}

function createIsland(island) {
  const { group, config } = createIslandTerrain(island);
  group.position.set(config.position[0], config.elevation ?? 0, config.position[1]);
  group.rotation.y = config.rotation;
  group.userData.islandId = island.id;
  group.userData.baseY = config.elevation ?? 0;

  const building = createBuilding(config.building, config.palette.roof);
  building.position.set(0, .18, -.1);
  // Terrain can rotate for variety, but every building facade faces the viewer.
  building.rotation.y = -config.rotation;
  group.add(building);

  const treeLeft = createTree();
  treeLeft.scale.setScalar(config.props[0][3]);
  treeLeft.position.set(config.props[0][0], config.props[0][1], config.props[0][2]);
  group.add(treeLeft);

  const treeRight = createTree();
  treeRight.scale.setScalar(config.props[1][3]);
  treeRight.position.set(config.props[1][0], config.props[1][1], config.props[1][2]);
  group.add(treeRight);

  const lamp = createLamp();
  lamp.position.set(config.props[2][0], config.props[2][1], config.props[2][2]);
  group.add(lamp);

  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(5.7, 2.4, 3.8),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  hit.position.y = .72;
  hit.userData.islandId = island.id;
  hit.userData.islandGroup = group;
  group.add(hit);

  return group;
}

function createConnection(from, to, index = 0) {
  const start = new THREE.Vector3(from.position[0], from.elevation + .28, from.position[1]);
  const end = new THREE.Vector3(to.position[0], to.elevation + .2, to.position[1]);
  const direction = end.clone().sub(start);
  const distance = direction.length();
  const steps = Math.max(4, Math.floor(distance / .58));
  const unit = direction.clone().normalize();
  const group = new THREE.Group();
  group.userData.connection = true;

  for (let step = 1; step < steps; step += 1) {
    const progress = step / steps;
    const tile = createBlock({
      top: step % 2 === 0 ? COLORS.cream : COLORS.path,
      side: COLORS.soil,
      bottom: COLORS.stoneDark,
      height: .14,
    });
    tile.scale.set(.62, 1, .62);
    tile.position.copy(start).lerp(end, progress);
    tile.position.y += Math.sin(progress * Math.PI) * .08;
    tile.rotation.y = Math.atan2(unit.x, unit.z) + (index % 2 ? .08 : -.08);
    group.add(tile);
  }
  return group;
}

function createCloud(x, y, z, scale = 1, rotation = 0, variant = 0) {
  const cloud = new THREE.Group();
  const variants = [
    [[0, 0, 0], [.8, .08, 0], [-.8, .05, 0], [0, .22, .15]],
    [[0, 0, 0], [.76, .04, .05], [-.64, .08, 0], [-.18, .23, .12], [.38, .2, -.1]],
    [[0, 0, 0], [.9, .05, 0], [-.84, .04, 0], [.18, .26, .1]],
  ];
  const blocks = variants[variant % variants.length];
  blocks.forEach(([bx, by, bz]) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.2, .26, .6), material(COLORS.cloud, { transparent: true, opacity: .62 }));
    block.position.set(bx, by, bz);
    cloud.add(block);
  });
  cloud.position.set(x, y, z);
  cloud.rotation.y = rotation;
  cloud.scale.setScalar(scale);
  return cloud;
}

function createSkyWorld({ canvas, islands, onSelect, reducedMotion = false } = {}) {
  if (!canvas) throw new Error('sky canvas is required');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(COLORS.sky, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  const viewTarget = new THREE.Vector3(0, 0.45, -0.45);
  camera.position.set(0, 8.4, 18.5);
  camera.lookAt(viewTarget);

  scene.add(new THREE.HemisphereLight(0xfff7e5, 0x4a5870, 2.2));
  const sun = new THREE.DirectionalLight(0xfff0cf, 2.2);
  sun.position.set(-4, 10, 6);
  scene.add(sun);

  const world = new THREE.Group();
  scene.add(world);
  const islandGroups = islands.map(createIsland);
  const profileLayout = ISLAND_LAYOUTS.profile;
  islands
    .filter((island) => island.id !== 'profile')
    .forEach((island, index) => {
      const layout = ISLAND_LAYOUTS[island.id];
      if (layout) world.add(createConnection(profileLayout, layout, index));
    });
  islandGroups.forEach((group) => world.add(group));
  const clouds = [
    createCloud(-7.4, 2.1, -3.8, 1.05, -.18, 0),
    createCloud(7.1, 2.6, 1.2, 1.25, .2, 1),
    createCloud(-.2, .8, -7.4, .78, -.12, 2),
    createCloud(-7.3, 4.15, 3.7, .82, .28, 1),
    createCloud(6.6, 4.25, -4.9, .92, -.32, 2),
    createCloud(.6, 4.8, 6.6, .68, .16, 0),
  ];
  clouds.forEach((cloud) => world.add(cloud));

  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const pickables = islandGroups.flatMap((group) => group.children.filter((child) => child.userData.islandId));
  let hovered = null;
  let shouldAnimate = true;
  let frame = 0;
  let motionReduced = reducedMotion;

  function resize() {
    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    const aspect = width / height;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    updateIslandLabels();
  }

  function updateIslandLabels() {
    const stage = canvas.parentElement;
    if (!stage) return;
    const labels = new Map([...stage.querySelectorAll('[data-island-id]')].map((button) => [button.dataset.islandId, button]));
    islandGroups.forEach((group) => {
      const label = labels.get(group.userData.islandId);
      if (!label) return;
      const point = new THREE.Vector3(group.position.x, group.position.y + 2.0, group.position.z);
      point.project(camera);
      label.style.left = `${(point.x * .5 + .5) * 100}%`;
      label.style.top = `${(-point.y * .5 + .5) * 100}%`;
    });
  }

  function getHit(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    return hit?.object?.userData?.islandGroup ?? null;
  }

  function setHovered(group) {
    if (hovered === group) return;
    if (hovered) hovered.userData.hovered = false;
    hovered = group;
    if (hovered) hovered.userData.hovered = true;
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  }

  function pointerMove(event) { setHovered(getHit(event)); }
  function pointerLeave() { setHovered(null); }
  function pointerDown(event) {
    const target = getHit(event);
    if (target?.userData?.islandId) onSelect?.(target.userData.islandId);
  }

  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerleave', pointerLeave);
  canvas.addEventListener('pointerdown', pointerDown);
  resize();

  function render(timestamp = 0) {
    if (!shouldAnimate) return;
    frame = requestAnimationFrame(render);
    islandGroups.forEach((group, index) => {
      const target = group.userData.hovered ? 1.08 : 1;
      group.scale.lerp(new THREE.Vector3(target, target, target), .12);
      group.position.y = group.userData.baseY + (motionReduced ? 0 : Math.sin(timestamp / 1200 + index * 1.7) * .08);
    });
    updateIslandLabels();
    renderer.render(scene, camera);
  }
  render();

  return {
    resize,
    setReducedMotion(value) { motionReduced = Boolean(value); },
    destroy() {
      shouldAnimate = false;
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerleave', pointerLeave);
      canvas.removeEventListener('pointerdown', pointerDown);
      renderer.dispose();
    },
  };
}

export { COLORS, createBlock, createBuilding, createIslandTerrain, createSkyWorld };
