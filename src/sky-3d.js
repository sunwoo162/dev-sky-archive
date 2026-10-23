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
  personal: { position: [-4.4, 1.8], palette: { top: COLORS.grass, roof: COLORS.coral }, building: 'archive' },
  team: { position: [4.4, 2.1], palette: { top: COLORS.blue, roof: 0x6d8ed0 }, building: 'team' },
  frontend: { position: [-3.5, -3.2], palette: { top: COLORS.violet, roof: 0x7c67cd }, building: 'frontend' },
  til: { position: [3.8, -3.1], palette: { top: COLORS.mint, roof: 0x4e8c72 }, building: 'til' },
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
  const cells = [
    [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1],
    [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0],
    [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1],
  ];

  cells.forEach(([x, z], index) => {
    const top = createBlock({ top: config.palette.top, side: COLORS.soil, bottom: COLORS.stoneDark, height: 0.42 });
    top.position.set(x * TILE, 0, z * TILE);
    group.add(top);

    const lower = createBlock({ top: COLORS.stone, side: COLORS.stoneDark, bottom: COLORS.stoneDark, height: 0.42 });
    lower.position.set(x * TILE, -0.42, z * TILE);
    group.add(lower);

    if (index % 2 === 0) {
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
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.05, 1.06), [
    material(0x8395a4), material(0x738798), material(0xf1d79a), material(0x5a6a7c), material(0x8799a7), material(0x6a7a8b),
  ]);
  body.position.y = .72;
  group.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(.98, .55, 4), material(roofColor));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 1.52;
  group.add(roof);

  if (type === 'frontend') {
    const node = new THREE.Mesh(new THREE.OctahedronGeometry(.2, 0), material(COLORS.violet, { emissive: COLORS.violet, emissiveIntensity: .5 }));
    node.position.set(0, 2.05, 0);
    group.add(node);
  }

  const door = new THREE.Mesh(new THREE.BoxGeometry(.26, .46, .03), material(COLORS.navy));
  door.position.set(0, .44, .55);
  group.add(door);

  const windowMaterial = material(COLORS.cream, { emissive: COLORS.cream, emissiveIntensity: .18 });
  [-.4, .4].forEach((x) => {
    const window = new THREE.Mesh(new THREE.BoxGeometry(.19, .2, .03), windowMaterial);
    window.position.set(x, .88, .55);
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
  group.position.set(config.position[0], 0, config.position[1]);
  group.userData.islandId = island.id;
  group.userData.baseY = 0;

  const building = createBuilding(config.building, config.palette.roof);
  building.position.set(0, .18, -.1);
  group.add(building);

  const treeLeft = createTree();
  treeLeft.scale.setScalar(.72);
  treeLeft.position.set(-1.45, .18, .35);
  group.add(treeLeft);

  const treeRight = createTree();
  treeRight.scale.setScalar(.62);
  treeRight.position.set(1.36, .18, -.6);
  group.add(treeRight);

  const lamp = createLamp();
  lamp.position.set(1.48, .18, .55);
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

function createCloud(x, y, z, scale = 1) {
  const cloud = new THREE.Group();
  const blocks = [[0, 0, 0], [.8, .08, 0], [-.8, .05, 0], [0, .22, .15]];
  blocks.forEach(([bx, by, bz]) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.2, .26, .6), material(COLORS.cloud, { transparent: true, opacity: .62 }));
    block.position.set(bx, by, bz);
    cloud.add(block);
  });
  cloud.position.set(x, y, z);
  cloud.scale.setScalar(scale);
  return cloud;
}

function createSkyWorld({ canvas, islands, onSelect, reducedMotion = false } = {}) {
  if (!canvas) throw new Error('sky canvas is required');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(COLORS.sky, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, .1, 100);
  camera.position.set(9, 10, 9);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xfff7e5, 0x4a5870, 2.2));
  const sun = new THREE.DirectionalLight(0xfff0cf, 2.2);
  sun.position.set(-4, 10, 6);
  scene.add(sun);

  const world = new THREE.Group();
  scene.add(world);
  const islandGroups = islands.map(createIsland);
  islandGroups.forEach((group) => world.add(group));
  world.add(createCloud(-7, 1.8, -3, 1.2));
  world.add(createCloud(6.8, 2.5, 1.5, 1.35));
  world.add(createCloud(0, .5, -7, .8));

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
    const size = 8.8;
    camera.left = -size * aspect;
    camera.right = size * aspect;
    camera.top = size;
    camera.bottom = -size;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
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
      group.position.y = motionReduced ? 0 : Math.sin(timestamp / 1200 + index * 1.7) * .08;
    });
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
