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
    position: [0, 1.55], rotation: 0.02, elevation: 1.0, scale: 1.34, labelHeight: 3.05,
    palette: { top: 0xe0ba69, highlight: 0xf2d47b, path: 0xf7c66b, roof: 0x756581 }, building: 'profile',
    cells: [[-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2], [0, -2]],
    props: [[-1.18, 0.18, 0.44, 0.58], [1.18, 0.18, -0.5, 0.58], [1.25, 0.18, 0.46]],
  },
  personal: {
    position: [-6.05, 3.15], rotation: -0.12, elevation: 0.05, scale: 1.08, labelHeight: 2.2,
    palette: { top: COLORS.grass, highlight: COLORS.grassLight, path: 0xf0a477, roof: COLORS.coral }, building: 'archive',
    cells: [[-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1]],
    props: [[-1.35, 0.18, 0.4, 0.72], [1.35, 0.18, -0.56, 0.58], [1.5, 0.18, 0.52]],
  },
  team: {
    position: [6.05, 3.0], rotation: 0.16, elevation: 0.62, scale: 1.12, labelHeight: 2.55,
    palette: { top: COLORS.blue, highlight: 0xa9c9ea, path: 0xb8d5f2, roof: 0x6d8ed0 }, building: 'team',
    cells: [[-1, -2], [0, -2], [1, -2], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1]],
    props: [[-1.42, 0.18, 0.5, 0.62], [1.35, 0.18, -0.8, 0.7], [1.55, 0.18, 0.48]],
  },
  external: {
    position: [-5.95, -4.15], rotation: 0.34, elevation: 2.3, scale: 1.0, labelHeight: 3.35,
    palette: { top: 0x87b5c2, highlight: 0xb1d8d0, path: 0xaedbd3, roof: 0x5d8ca1 }, building: 'external',
    cells: [[-2, -1], [-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1]],
    props: [[-1.42, 0.18, 0.42, 0.76], [1.55, 0.18, -0.62, 0.55], [1.42, 0.18, 0.5]],
  },
  study: {
    position: [5.9, -4.35], rotation: -0.26, elevation: 0.28, scale: 1.0, labelHeight: 2.95,
    palette: { top: 0xa8bf8b, highlight: 0xd4dc9d, path: 0xd9d98a, roof: 0x7b7554 }, building: 'study',
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
    const top = createBlock({ top: index % 4 === 0 ? (config.palette.highlight ?? config.palette.top) : config.palette.top, side: COLORS.soil, bottom: COLORS.stoneDark, height: 0.42 });
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
  const addBox = (width, height, depth, x, y, z, color, rotationY = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color));
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotationY;
    group.add(mesh);
    return mesh;
  };
  const addFrontWindow = (x, y, z, color, width = .2, height = .2) => {
    const window = addBox(width, height, .04, x, y, z, color);
    window.userData.isWindow = true;
    return window;
  };
  const lit = (color) => material(color, { emissive: color, emissiveIntensity: .2 });

  if (type === 'profile') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.34, 1.62, 8), material(0x756581));
    body.position.y = .95;
    group.add(body);
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.48, .18, 8), material(0x5d4f6f));
    plinth.position.y = .18;
    group.add(plinth);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.42, .62, 8), material(roofColor));
    roof.position.y = 2.07;
    group.add(roof);
    addBox(.58, .5, .7, -1.15, .72, -.04, 0x5d4f6f);
    addBox(.58, .66, .7, 1.15, .8, -.04, 0x665773);
    addBox(1.9, .12, .82, 0, 1.5, -.02, 0xf2d47b);
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(.88, .07, 4, 8), material(COLORS.path, { emissive: COLORS.path, emissiveIntensity: .26 }));
    orbit.rotation.x = Math.PI / 2;
    orbit.position.y = 1.56;
    group.add(orbit);
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .12, 8), lit(COLORS.cream));
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0, 1.12, 1.2);
    group.add(badge);
    const coreCap = new THREE.Mesh(new THREE.OctahedronGeometry(.28, 0), lit(COLORS.coral));
    coreCap.position.y = 2.45;
    group.add(coreCap);
    [-.64, .64].forEach((x) => addBox(.16, .72, .16, x, 1.0, .76, COLORS.path));
    addFrontWindow(-.42, 1.05, 1.16, COLORS.cream, .22, .26);
    addFrontWindow(.42, 1.05, 1.16, COLORS.cream, .22, .26);
    addBox(.3, .52, .05, 0, .58, 1.2, COLORS.navy);
  } else if (type === 'archive') {
    addBox(1.68, 1.12, 1.36, 0, .78, 0, 0x8395a4);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.22, .58, 4), material(roofColor));
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 1.63;
    group.add(roof);
    addBox(1.25, .1, .1, 0, .88, .72, COLORS.coral);
    addFrontWindow(-.42, .98, .7, 0xffe6ad, .22, .25);
    addFrontWindow(.42, .98, .7, 0xffe6ad, .22, .25);
    addBox(.3, .52, .05, 0, .55, .7, COLORS.navy);
    const archiveStack = [0xffb277, 0xf1d79a, 0x8ec5ad];
    archiveStack.forEach((color, index) => addBox(.58 - index * .08, .14, .48, .86, .38 + index * .16, .5, color, index % 2 ? .12 : -.08));
    addBox(.12, .7, .12, 0, 2.03, 0, COLORS.coral);
    addBox(.58, .2, .04, .28, 2.19, .1, COLORS.cream);
  } else if (type === 'team') {
    [-.72, .72].forEach((x, index) => {
      addBox(.68, 1.5 - index * .12, .94, x, .98, 0, index ? 0x5b6d83 : 0x71869a);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(.52, .3, 4), material(index ? 0x6d8ed0 : 0x8eb5e3));
      roof.rotation.y = Math.PI / 4;
      roof.position.set(x, 1.88 - index * .06, 0);
      group.add(roof);
      addFrontWindow(x, 1.02, .5, 0xd3efff, .23, .3);
    });
    addBox(1.92, .22, .72, 0, 1.48, 0, COLORS.blue);
    const meeting = new THREE.Mesh(new THREE.CylinderGeometry(.46, .46, .34, 8), lit(0xc6d9ec));
    meeting.position.set(0, 1.72, .08);
    group.add(meeting);
    addBox(1.62, .12, .08, 0, .68, .68, 0x8eb5e3);
    addBox(.3, .52, .05, -.72, .52, .5, COLORS.navy);
    addBox(.3, .52, .05, .72, .52, .5, COLORS.navy);
  } else if (type === 'external') {
    addBox(2.0, .38, 1.3, 0, .35, 0, 0x5d8190);
    addBox(1.44, .16, .92, 0, .61, 0, 0x83a8aa);
    [-.74, .74].forEach((x) => addBox(.2, 1.58, .2, x, 1.28, .62, COLORS.cream));
    addBox(1.68, .2, .2, 0, 2.03, .62, COLORS.cream);
    const portal = new THREE.Mesh(new THREE.TorusGeometry(.57, .12, 4, 8), lit(COLORS.mint));
    portal.position.set(0, 1.22, .75);
    group.add(portal);
    const node = new THREE.Mesh(new THREE.OctahedronGeometry(.27, 0), lit(COLORS.mint));
    node.position.set(0, 2.38, .62);
    group.add(node);
    addBox(.3, .5, .05, 0, .48, .7, COLORS.navy);
  } else {
    addBox(1.28, 1.9, 1.12, 0, 1.05, 0, 0x68776b);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(.86, .38, 4), material(roofColor));
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 2.19;
    group.add(roof);
    addFrontWindow(-.32, 1.15, .59, 0xffedb9, .22, .25);
    addFrontWindow(.32, 1.15, .59, 0xffedb9, .22, .25);
    addFrontWindow(-.32, 1.56, .59, 0xffedb9, .22, .25);
    addFrontWindow(.32, 1.56, .59, 0xffedb9, .22, .25);
    addBox(.3, .52, .05, 0, .58, .59, COLORS.navy);
    const bookColors = [COLORS.coral, COLORS.path, COLORS.mint, 0x9b8be7];
    bookColors.forEach((color, index) => addBox(.82 - index * .08, .13, .54, .83, .45 + index * .16, .42, color, index % 2 ? .14 : -.08));
    addBox(.1, .58, .08, 1.12, 1.03, .45, COLORS.coral);
  }
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
  group.scale.setScalar(config.scale ?? 1);
  group.rotation.y = config.rotation;
  group.userData.islandId = island.id;
  group.userData.baseY = config.elevation ?? 0;
  group.userData.baseScale = config.scale ?? 1;

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
  const perpendicular = new THREE.Vector3(-unit.z, 0, unit.x);
  const curveOffset = (index % 2 === 0 ? 1 : -1) * .68;
  const control = start.clone().lerp(end, .5).add(perpendicular.multiplyScalar(curveOffset));
  control.y += .3 + (index === 1 ? .15 : 0);
  const curve = new THREE.QuadraticBezierCurve3(start, control, end);
  const group = new THREE.Group();
  group.userData.connection = true;

  for (let step = 1; step < steps; step += 1) {
    const progress = step / steps;
    const tile = createBlock({
      top: step % 2 === 0 ? (to.palette.path ?? COLORS.cream) : COLORS.cream,
      side: COLORS.soil,
      bottom: COLORS.stoneDark,
      height: .14,
    });
    tile.scale.set(.62, 1, .62);
    tile.position.copy(curve.getPoint(progress));
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

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(COLORS.sky, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COLORS.sky, 18, 42);
  const camera = new THREE.PerspectiveCamera(44, 1, .1, 100);
  const viewTarget = new THREE.Vector3(0, 1.15, -0.8);
  camera.position.set(2.6, 5.8, 20.6);
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
      const config = ISLAND_LAYOUTS[group.userData.islandId] ?? ISLAND_LAYOUTS.personal;
      const point = new THREE.Vector3(group.position.x, group.position.y + (config.labelHeight ?? 2.0), group.position.z);
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
      const target = group.userData.baseScale * (group.userData.hovered ? 1.08 : 1);
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
