import {
  closeProject,
  createInitialState,
  enterIsland,
  exitToSky,
  openProject,
} from './game-state.js';
import { findIsland, findProject, islands } from './content.js';
import { assetCatalog, assetUrl } from './asset-catalog.js';

const screens = {
  sky: document.querySelector('#sky-screen'),
  island: document.querySelector('#island-screen'),
  project: document.querySelector('#project-screen'),
};

const topbarMode = document.querySelector('#topbar-mode');
const islandList = document.querySelector('#island-list');
const projectMarkers = document.querySelector('#project-markers');
const projectIndex = document.querySelector('#project-index');
const interactionToast = document.querySelector('#interaction-toast');
const interactionText = document.querySelector('#interaction-text');
const archiveModal = document.querySelector('#archive-index-modal');
const archiveIndexTrigger = document.querySelector('#archive-index-trigger');
const archiveIndexClose = document.querySelector('#archive-index-close');
const archiveIndexMeta = document.querySelector('#archive-index-meta');
const archiveIndexList = document.querySelector('#archive-index-list');
const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const skyStage = document.querySelector('#sky-stage');
const sky3dCanvas = document.querySelector('#sky-3d-canvas');
const sky3dFallback = document.querySelector('#sky-3d-fallback');

let state = createInitialState();
let currentIsland = null;
let repoInventory = [];
let lastArchiveFocus = null;
let lastProjectFocusProjectId = null;
let lastProjectFocusSource = 'marker';
let player = { x: 480, y: 350 };
const pressedKeys = new Set();
let lastFrame = performance.now();
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = reducedMotionQuery.matches;
const assetImages = new Map();
const assetPatterns = new Map();
let skyWorld = null;

reducedMotionQuery.addEventListener?.('change', (event) => {
  prefersReducedMotion = event.matches;
  skyWorld?.setReducedMotion(prefersReducedMotion);
});

const markerPositions = [
  { x: 286, y: 246, left: 30, top: 46 },
  { x: 676, y: 326, left: 70, top: 61 },
  { x: 470, y: 170, left: 49, top: 31 },
  { x: 190, y: 420, left: 20, top: 78 },
  { x: 790, y: 430, left: 82, top: 80 },
  { x: 520, y: 350, left: 54, top: 65 },
];

function preloadAssets() {
  Object.entries(assetCatalog).forEach(([id, entry]) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      assetImages.set(id, image);
      assetPatterns.set(id, context.createPattern(image, 'repeat'));
    };
    image.src = assetUrl(id);
  });
}

function drawAsset(id, x, y, width, height) {
  const image = assetImages.get(id);
  if (!image) return false;
  context.drawImage(image, x, y, width, height);
  return true;
}

function setScreen(nextState) {
  state = nextState;
  document.body.classList.toggle('is-sky-mode', state.screen === 'sky');
  Object.entries(screens).forEach(([name, screen]) => {
    screen.classList.toggle('is-hidden', name !== state.screen);
  });
  topbarMode.textContent = state.screen === 'sky' ? 'SKY MAP' : state.screen === 'island' ? '2D ISLAND WORLD' : 'PROJECT EXHIBIT';

  if (state.screen === 'island') renderIsland();
  if (state.screen === 'project') renderProject();
  if (state.screen === 'sky') requestAnimationFrame(() => skyWorld?.resize());
}

const classificationLabels = {
  'candidate-project': 'FEATURED CANDIDATES',
  'learning-log': 'LEARNING LOGS',
  tooling: 'TOOLS / AUTOMATION',
  'profile-tooling': 'PROFILE TOOLING',
  sandbox: 'SANDBOXES',
  'dependency-or-study': 'STUDY / DEPENDENCY',
  'empty-or-placeholder': 'EMPTY / PLACEHOLDER',
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]);
}

function renderArchiveIndex() {
  if (!repoInventory.length) {
    archiveIndexMeta.textContent = 'INVENTORY UNAVAILABLE / PLAYABLE MAP STILL ONLINE';
    archiveIndexList.innerHTML = '<p class="archive-index-empty">레포 인벤토리를 불러오지 못했어요. 프로젝트 섬 탐방은 계속 사용할 수 있습니다.</p>';
    return;
  }

  const groups = repoInventory.reduce((result, repo) => {
    const group = result.get(repo.classification) ?? [];
    group.push(repo);
    result.set(repo.classification, group);
    return result;
  }, new Map());
  const orderedGroups = [...groups.entries()].sort(([left], [right]) => {
    const order = ['candidate-project', 'learning-log', 'tooling', 'profile-tooling', 'sandbox', 'dependency-or-study', 'empty-or-placeholder'];
    return (order.indexOf(left) === -1 ? 99 : order.indexOf(left)) - (order.indexOf(right) === -1 ? 99 : order.indexOf(right));
  });

  archiveIndexMeta.textContent = `${repoInventory.length} REPOSITORIES / ${orderedGroups.length} CATEGORIES / READ-ONLY`; 
  archiveIndexList.innerHTML = orderedGroups.map(([classification, repositories]) => `
    <section class="archive-index-group">
      <div class="archive-index-group-head"><h3>${escapeHtml(classificationLabels[classification] ?? classification)}</h3><span>${repositories.length.toString().padStart(2, '0')}</span></div>
      <div class="archive-index-items">${repositories.sort((left, right) => left.name.localeCompare(right.name)).map((repo) => `
        <article class="archive-index-item"><div><strong>${escapeHtml(repo.name)}</strong><p>${escapeHtml(repo.note)}</p></div><span>${escapeHtml(repo.classification)}</span></article>
      `).join('')}</div>
    </section>
  `).join('');
}

async function loadRepoInventory() {
  try {
    const response = await fetch('./data/repo-inventory.json');
    if (!response.ok) throw new Error(`inventory request failed: ${response.status}`);
    const payload = await response.json();
    repoInventory = Array.isArray(payload.repositories) ? payload.repositories : [];
  } catch {
    repoInventory = [];
  }
  renderArchiveIndex();
}

function openArchiveIndex() {
  lastArchiveFocus = document.activeElement;
  archiveModal.classList.remove('is-hidden');
  archiveModal.setAttribute('aria-hidden', 'false');
  archiveIndexClose.focus();
}

function closeArchiveIndex() {
  archiveModal.classList.add('is-hidden');
  archiveModal.setAttribute('aria-hidden', 'true');
  if (lastArchiveFocus instanceof HTMLElement) lastArchiveFocus.focus();
}

function trapArchiveFocus(event) {
  const focusable = [...archiveModal.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
  if (!focusable.length) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openProjectFromControl(projectId, source = 'marker') {
  lastProjectFocusProjectId = projectId;
  lastProjectFocusSource = source;
  setScreen(openProject(state, projectId));
  document.querySelector('#close-project')?.focus();
}

function closeProjectToIsland() {
  setScreen(closeProject(state));
  const projectFocusTarget = [...document.querySelectorAll('[data-project-id]')]
    .find((element) => element.dataset.projectId === lastProjectFocusProjectId && element.dataset.projectSource === lastProjectFocusSource);
  projectFocusTarget?.focus();
}

function renderSky() {
  islandList.innerHTML = islands.map((island) => `
    <button class="island-button" type="button" data-island-id="${island.id}"
      style="--island-x:${island.position.x}%;--island-y:${island.position.y}%;--island-scale:${island.position.scale};--island-color:${island.color};--island-accent:${island.accent};"
      aria-label="${island.title} 섬 입장">
      <span class="island-scene" aria-hidden="true">
        <img class="island-selection-ring" data-asset-id="selection-ring" src="${assetUrl('selection-ring')}" alt="" />
        <img class="island-bed" data-asset-id="${island.worldBaseAssetId}" src="${assetUrl(island.worldBaseAssetId)}" alt="" />
        <img class="island-top" data-asset-id="${island.worldAssetId}" src="${assetUrl(island.worldAssetId)}" alt="" />
        ${(island.worldPropIds ?? []).map((assetId, index) => `<img class="sky-prop sky-prop-${index + 1}" data-asset-id="${assetId}" src="${assetUrl(assetId)}" alt="" />`).join('')}
      </span>
      <span class="island-flag" aria-hidden="true">${island.index}</span>
      <span class="island-card">
        <span class="island-icon" aria-hidden="true">${island.id === 'personal' ? '✦' : island.id === 'team' ? '◈' : island.id === 'frontend' ? '⌘' : '✎'}</span>
        <span class="island-name">${island.shortTitle}</span>
        <span class="island-subtitle">${island.projects.length} EXHIBIT${island.projects.length > 1 ? 'S' : ''}</span>
      </span>
    </button>
  `).join('');

  islandList.querySelectorAll('[data-island-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const islandId = button.dataset.islandId;
      player = { x: 480, y: 365 };
      setScreen(enterIsland(state, islandId));
    });
  });
}

async function setupSkyWorld() {
  if (!sky3dCanvas) return;
  try {
    const { createSkyWorld } = await import('./sky-3d.js');
    skyWorld = createSkyWorld({
      canvas: sky3dCanvas,
      islands,
      reducedMotion: prefersReducedMotion,
      onSelect: (islandId) => {
        player = { x: 480, y: 365 };
        setScreen(enterIsland(state, islandId));
      },
    });
    skyStage.classList.add('has-3d');
  } catch (error) {
    sky3dFallback?.classList.remove('is-hidden');
    skyStage?.classList.add('has-3d-fallback');
    console.warn('3D sky world unavailable; keeping the accessible DOM map.', error);
  }
}

function getMarkerPosition(index) {
  return markerPositions[index % markerPositions.length];
}

function renderIsland() {
  currentIsland = findIsland(state.islandId);
  document.querySelector('#island-eyebrow').textContent = `${currentIsland.index} / ${currentIsland.title}`;
  document.querySelector('#island-title').textContent = currentIsland.title;
  document.querySelector('#island-subtitle').textContent = currentIsland.subtitle;
  document.querySelector('#island-description').textContent = currentIsland.description;
  document.querySelector('#island-count').textContent = `${currentIsland.projects.length} PROJECT EXHIBIT${currentIsland.projects.length > 1 ? 'S' : ''}`;
  document.querySelector('#island-screen').style.setProperty('--island-accent', currentIsland.color);

  projectMarkers.innerHTML = currentIsland.projects.map((project, index) => {
    const marker = getMarkerPosition(index);
    return `<button class="project-marker" type="button" data-project-id="${project.id}" data-project-source="marker" style="--marker-left:${marker.left}%;--marker-top:${marker.top}%;--marker-color:${project.color}" aria-label="${project.title} 전시 열기">
      <span class="marker-pulse" aria-hidden="true"></span><span class="marker-pin" aria-hidden="true"><img src="${assetUrl('cursor-open')}" alt="" /></span><span class="marker-label">${project.title}</span>
    </button>`;
  }).join('');

  projectIndex.innerHTML = currentIsland.projects.map((project, index) => `
    <button class="project-index-item" type="button" data-project-id="${project.id}" data-project-source="index">
      <span class="index-number">0${index + 1}</span><span><strong>${project.title}</strong><small>${project.summary}</small></span><span class="index-arrow">↗</span>
    </button>
  `).join('');

  document.querySelectorAll('[data-project-id]').forEach((button) => {
    button.addEventListener('click', () => openProjectFromControl(button.dataset.projectId, button.dataset.projectSource));
  });
  updateInteraction();
}

function visualMarkup(project) {
  if (project.visual === 'archive') {
    return `<div class="preview-window archive-window"><div class="preview-nav"><span class="preview-logo">dev-sky-archive / map</span><span class="archive-live">● PLAYABLE</span></div><div class="archive-stage"><div class="archive-route archive-route-one"></div><div class="archive-route archive-route-two"></div><i class="archive-island archive-island-one">01</i><i class="archive-island archive-island-two">02</i><i class="archive-island archive-island-three">03</i><span class="archive-player">YOU</span></div><div class="archive-caption">3D sky map → 2D island → exhibit</div></div>`;
  }
  if (project.visual === 'washer') {
    return `<div class="preview-window washer-window"><div class="preview-nav"><span class="preview-logo">washer/</span><span class="preview-avatar">YU</span></div><div class="washer-body"><div><small>MON, 14 OCT</small><h4>오늘의 세탁실</h4></div><div class="machine-stack"><div class="machine-row"><span class="machine-icon">○</span><span><b>세탁기 03</b><small>사용 가능 · 18분</small></span><em>예약</em></div><div class="machine-row active"><span class="machine-icon">◌</span><span><b>세탁기 07</b><small>사용 중 · 24분 남음</small></span><em>대기</em></div><div class="machine-row"><span class="machine-icon">○</span><span><b>건조기 02</b><small>사용 가능 · 42분</small></span><em>예약</em></div></div></div></div>`;
  }
  if (project.visual === 'repo') {
    return `<div class="preview-window repo-window"><div class="preview-nav"><span class="preview-logo">repo / workflow</span><span class="repo-live">● SCHEMATIC</span></div><div class="kanban"><div><small>BACKLOG</small><b>error state</b><b>empty screen</b></div><div><small>IN PROGRESS</small><b class="selected">review item</b><b>mobile navigation</b></div><div><small>DONE</small><b>filter chips</b><b>loading state</b></div></div><div class="repo-flow"><span>REPO</span><i></i><span>STATE</span><i></i><span>VIEW</span></div></div>`;
  }
  if (project.visual === 'motion') {
    return `<div class="preview-window motion-window"><div class="preview-nav"><span class="preview-logo">motion / 003</span><span class="motion-spark">✦</span></div><div class="motion-stage"><div class="motion-card"><span>state change</span><strong>saved!</strong><i></i></div><div class="motion-track"><span></span><span></span><span></span><span></span><span></span></div></div><div class="motion-caption">feedback should feel like a reply</div></div>`;
  }
  if (project.visual === 'graph') {
    return `<div class="preview-window graph-window"><div class="preview-nav"><span class="preview-logo">graph-notes / bfs</span><span class="graph-step">STEP 04</span></div><div class="graph-stage"><div class="graph-node node-a">A</div><div class="graph-node node-b active">B</div><div class="graph-node node-c">C</div><div class="graph-node node-d">D</div><div class="graph-line line-a"></div><div class="graph-line line-b"></div><div class="graph-line line-c"></div></div><div class="graph-code"><span>queue.push(node)</span><span class="code-highlight">visited.add(next)</span></div></div>`;
  }
  return `<div class="preview-window generic-window"><div class="preview-nav"><span class="preview-logo">project / preview</span></div><div class="generic-lines"><i></i><i></i><i></i></div></div>`;
}

function renderMaterials(project) {
  const materialAssetMap = {
    SCREEN: 'project-screen',
    SYSTEM: 'project-system',
    ROLE: 'project-role',
    EVIDENCE: 'project-evidence',
    PORTFOLIO: project.assetId,
    SELFINTRO: 'project-role',
    PROJECT: 'project-screen',
    OTHER: 'project-evidence',
  };
  return project.materials.map((material, index) => `
    <article class="material-card material-${material.kind.toLowerCase()}">
      <div class="material-art" aria-hidden="true"><img src="${assetUrl(materialAssetMap[material.kind] ?? 'project-screen')}" alt="" /><span>${material.kind} / ${String(index + 1).padStart(2, '0')}</span><b>REPLACE WITH REAL MATERIAL</b></div>
      <div class="material-card-head"><span>${material.label}</span><em>TEMP</em></div>
      <h3>${material.title}</h3>
      <p>${material.description}</p>
      <small>${material.format}</small>
    </article>
  `).join('');
}

function renderProject() {
  const { project, island } = findProject(state.projectId);
  const projectAction = project.repoUrl
    ? `<a class="primary-action" href="${project.repoUrl}" target="_blank" rel="noreferrer">${project.linkLabel} <span>↗</span></a>`
    : `<button type="button" class="primary-action" disabled>${project.linkLabel} <span>↗</span></button>`;
  const roleStatusLabel = project.roleStatus === 'needs-confirmation' ? 'NEEDS CONFIRMATION' : 'SELF-RECORDED';
  document.querySelector('#project-toolbar-meta').textContent = `${island.shortTitle} / PROJECT EXHIBIT`;
  document.querySelector('#project-exhibit').innerHTML = `
    <div class="exhibit-grid" style="--project-color:${project.color}">
      <div class="exhibit-copy">
        <p class="eyebrow">${project.category}</p>
        <h1 id="project-title">${project.title}</h1>
        <p class="exhibit-summary">${project.summary}</p>
        <div class="project-tags">${project.stack.map((tag) => `<span>${tag}</span>`).join('')}</div>
        <div class="exhibit-meta"><span><b>REPOSITORY</b>${project.repo}</span><span><b>STATUS</b>${project.status}</span><span><b>ROLE CONFIDENCE</b>${roleStatusLabel}</span></div>
        <div class="exhibit-actions">${projectAction}<button type="button" class="text-action" id="inline-back">전시로 돌아가기</button></div>
      </div>
      <div class="exhibit-visual-wrap"><div class="visual-kicker"><span>INTERACTIVE CASE VIEW</span><span>01 / 04</span></div>${visualMarkup(project)}<div class="visual-shadow"></div></div>
      <div class="exhibit-dossier">
        <div class="dossier-label">PROJECT DOSSIER</div>
        <div class="dossier-block"><span>MY ROLE</span><strong>${project.role}</strong></div>
        <div class="dossier-block"><span>HOW IT MOVES</span><div class="flow-list">${project.flow.map((step, index) => `<div><i>0${index + 1}</i><b>${step}</b>${index < project.flow.length - 1 ? '<span class="flow-arrow">→</span>' : ''}</div>`).join('')}</div></div>
        <div class="dossier-block dossier-timeline"><span>DEVELOPMENT LOG</span><div class="timeline-list">${project.timeline.map((entry) => `<article class="timeline-item"><span class="timeline-phase">${entry.phase}</span><div><strong>${entry.title}</strong><p>${entry.detail}</p></div></article>`).join('')}</div><small class="timeline-source">SOURCE / ${project.detailSource}</small></div>
        <div class="dossier-block dossier-note"><span>WHY</span><p>${project.detail}</p></div>
      </div>
    </div>
    <section class="exhibit-materials" aria-labelledby="materials-title">
      <div class="materials-heading">
        <div><span class="materials-kicker">PORTFOLIO MATERIALS / TEMPORARY ARCHIVE</span><h2 id="materials-title">자료 보관함</h2></div>
        <span class="materials-status">${project.materials.length} SLOTS READY / REPLACE LATER</span>
      </div>
      <p class="materials-intro">포트폴리오, 자기소개서, 프로젝트 설명, 기타 증빙 자료가 들어갈 자리를 먼저 만들어뒀습니다. 지금은 화면 구조를 확인하기 위한 임시 카드입니다.</p>
      <div class="materials-grid">${renderMaterials(project)}</div>
    </section>
  `;
      document.querySelector('#inline-back').addEventListener('click', closeProjectToIsland);
}

function drawRoundedRect(x, y, width, height, radius, fill, stroke) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  if (stroke) {
    context.strokeStyle = stroke;
    context.stroke();
  }
}

function drawMap() {
  const islandColor = currentIsland?.color ?? '#8aa8ff';
  context.clearRect(0, 0, canvas.width, canvas.height);
  const grassPattern = assetPatterns.get('grass');
  context.fillStyle = grassPattern ?? '#9acb82';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.beginPath();
  context.moveTo(0, 390); context.bezierCurveTo(180, 300, 230, 420, 355, 345); context.bezierCurveTo(500, 260, 610, 382, 960, 250);
  const pathPattern = assetPatterns.get('path');
  context.lineWidth = 62; context.strokeStyle = pathPattern ?? '#dbc18b'; context.stroke();
  context.lineWidth = 44; context.strokeStyle = '#ead6a2'; context.stroke();

  drawAsset('archive-hall', 52, 45, 196, 171);
  drawAsset('archive-npc', 274, 118, 48, 64);
  drawAsset('signpost', 408, 120, 56, 72);
  drawAsset('project-kiosk', 770, 102, 72, 88);
  drawAsset('project-kiosk', 116, 396, 72, 88);

  markerPositions.slice(0, currentIsland?.projects.length ?? 1).forEach((marker, index) => {
    const project = currentIsland?.projects[index];
    if (!project) return;
    drawAsset('project-kiosk', marker.x - 36, marker.y - 44, 72, 88);
    drawAsset(project.assetId, marker.x - 23, marker.y - 34, 46, 28);
    context.fillStyle = project.color;
    context.fillRect(marker.x - 26, marker.y - 30, 52, 5);
  });

  const near = getNearestProject();
  if (near) {
        context.globalAlpha = prefersReducedMotion ? 0.35 : 0.35 + Math.sin(performance.now() / 240) * 0.12;
    context.strokeStyle = islandColor; context.lineWidth = 4; context.beginPath(); context.arc(near.marker.x, near.marker.y, 50, 0, Math.PI * 2); context.stroke(); context.globalAlpha = 1;
  }

  const px = Math.round(player.x); const py = Math.round(player.y);
  drawAsset('player', px - 24, py - 31, 48, 64);
}

function getNearestProject() {
  if (!currentIsland) return null;
  let closest = null;
  currentIsland.projects.forEach((project, index) => {
    const marker = getMarkerPosition(index);
    const distance = Math.hypot(player.x - marker.x, player.y - marker.y);
    if (distance < 92 && (!closest || distance < closest.distance)) closest = { project, marker, distance };
  });
  return closest;
}

function updateInteraction() {
  const nearest = getNearestProject();
  interactionToast.classList.toggle('is-visible', Boolean(nearest));
  if (nearest) interactionText.textContent = `${nearest.project.title} 전시 열기`;
  document.querySelector('#mini-coords').textContent = `X ${Math.round(player.x / 10)} / Y ${Math.round(player.y / 10)}`;
}

function movePlayer(delta) {
  if (state.screen !== 'island') return;
  const direction = { x: 0, y: 0 };
  if (pressedKeys.has('w') || pressedKeys.has('arrowup')) direction.y -= 1;
  if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) direction.y += 1;
  if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) direction.x -= 1;
  if (pressedKeys.has('d') || pressedKeys.has('arrowright')) direction.x += 1;
  const magnitude = Math.hypot(direction.x, direction.y) || 1;
  const speed = 170;
  player.x = Math.max(36, Math.min(canvas.width - 36, player.x + (direction.x / magnitude) * speed * delta));
  player.y = Math.max(36, Math.min(canvas.height - 36, player.y + (direction.y / magnitude) * speed * delta));
  updateInteraction();
}

function animate(timestamp) {
  const delta = Math.min((timestamp - lastFrame) / 1000, 0.05);
  lastFrame = timestamp;
  movePlayer(delta);
  if (state.screen === 'island') drawMap();
  requestAnimationFrame(animate);
}

document.querySelector('#back-to-sky').addEventListener('click', () => setScreen(exitToSky(state)));
document.querySelector('#brand-button').addEventListener('click', () => setScreen(exitToSky(state)));
document.querySelector('#back-to-island').addEventListener('click', closeProjectToIsland);
document.querySelector('#close-project').addEventListener('click', closeProjectToIsland);
archiveIndexTrigger.addEventListener('click', openArchiveIndex);
archiveIndexClose.addEventListener('click', closeArchiveIndex);
archiveModal.addEventListener('click', (event) => {
  if (event.target === archiveModal) closeArchiveIndex();
});

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const target = event.target instanceof HTMLElement ? event.target : null;
  const isInteractiveTarget = Boolean(target?.closest('button, a, input, select, textarea, [role="button"]'));
  if (key === ' ' && isInteractiveTarget) return;
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key) || (key === ' ' && !isInteractiveTarget)) event.preventDefault();
  if (!archiveModal.classList.contains('is-hidden') && key === 'escape') {
    closeArchiveIndex();
    return;
  }
  if (!archiveModal.classList.contains('is-hidden') && key === 'tab') {
    trapArchiveFocus(event);
    return;
  }
  if (state.screen === 'island' && key === 'e') {
    const nearest = getNearestProject();
    if (nearest) openProjectFromControl(nearest.project.id);
  }
  if (key === 'escape') {
    if (state.screen === 'project') closeProjectToIsland();
    else if (state.screen === 'island') setScreen(exitToSky(state));
  }
  pressedKeys.add(key);
});

window.addEventListener('keyup', (event) => pressedKeys.delete(event.key.toLowerCase()));

renderSky();
setScreen(state);
renderArchiveIndex();
loadRepoInventory();
preloadAssets();
setupSkyWorld();
requestAnimationFrame(animate);
