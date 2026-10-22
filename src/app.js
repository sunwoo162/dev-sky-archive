import {
  closeProject,
  createInitialState,
  enterIsland,
  exitToSky,
  openProject,
} from './game-state.js';
import { findIsland, findProject, islands } from './content.js';

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

let state = createInitialState();
let currentIsland = null;
let repoInventory = [];
let lastArchiveFocus = null;
let player = { x: 480, y: 350 };
const pressedKeys = new Set();
let lastFrame = performance.now();

const markerPositions = [
  { x: 286, y: 246, left: 30, top: 46 },
  { x: 676, y: 326, left: 70, top: 61 },
  { x: 470, y: 170, left: 49, top: 31 },
  { x: 190, y: 420, left: 20, top: 78 },
  { x: 790, y: 430, left: 82, top: 80 },
  { x: 520, y: 350, left: 54, top: 65 },
];

function setScreen(nextState) {
  state = nextState;
  Object.entries(screens).forEach(([name, screen]) => {
    screen.classList.toggle('is-hidden', name !== state.screen);
  });
  topbarMode.textContent = state.screen === 'sky' ? 'SKY MAP' : state.screen === 'island' ? '2D ISLAND WORLD' : 'PROJECT EXHIBIT';

  if (state.screen === 'island') renderIsland();
  if (state.screen === 'project') renderProject();
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

function renderSky() {
  islandList.innerHTML = islands.map((island) => `
    <button class="island-button" type="button" data-island-id="${island.id}"
      style="--island-x:${island.position.x}%;--island-y:${island.position.y}%;--island-scale:${island.position.scale};--island-color:${island.color};--island-accent:${island.accent};"
      aria-label="${island.title} 섬 입장">
      <span class="island-shadow" aria-hidden="true"></span>
      <span class="island-rock" aria-hidden="true"></span>
      <span class="island-land" aria-hidden="true"><i></i><i></i><i></i></span>
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
    return `<button class="project-marker" type="button" data-project-id="${project.id}" style="--marker-left:${marker.left}%;--marker-top:${marker.top}%;--marker-color:${project.color}" aria-label="${project.title} 전시 열기">
      <span class="marker-pulse" aria-hidden="true"></span><span class="marker-pin" aria-hidden="true">⌕</span><span class="marker-label">${project.title}</span>
    </button>`;
  }).join('');

  projectIndex.innerHTML = currentIsland.projects.map((project, index) => `
    <button class="project-index-item" type="button" data-project-id="${project.id}">
      <span class="index-number">0${index + 1}</span><span><strong>${project.title}</strong><small>${project.summary}</small></span><span class="index-arrow">↗</span>
    </button>
  `).join('');

  document.querySelectorAll('[data-project-id]').forEach((button) => {
    button.addEventListener('click', () => setScreen(openProject(state, button.dataset.projectId)));
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
    return `<div class="preview-window repo-window"><div class="preview-nav"><span class="preview-logo">repodock / sprint 08</span><span class="repo-live">● LIVE</span></div><div class="kanban"><div><small>BACKLOG</small><b>API error state</b><b>empty screen copy</b></div><div><small>IN PROGRESS</small><b class="selected">PR #142 · board query</b><b>mobile nav</b></div><div><small>DONE</small><b>filter chips</b><b>loading skeleton</b></div></div><div class="repo-flow"><span>REPO</span><i></i><span>STATE</span><i></i><span>BOARD</span></div></div>`;
  }
  if (project.visual === 'motion') {
    return `<div class="preview-window motion-window"><div class="preview-nav"><span class="preview-logo">motion / 003</span><span class="motion-spark">✦</span></div><div class="motion-stage"><div class="motion-card"><span>state change</span><strong>saved!</strong><i></i></div><div class="motion-track"><span></span><span></span><span></span><span></span><span></span></div></div><div class="motion-caption">feedback should feel like a reply</div></div>`;
  }
  if (project.visual === 'graph') {
    return `<div class="preview-window graph-window"><div class="preview-nav"><span class="preview-logo">graph-notes / bfs</span><span class="graph-step">STEP 04</span></div><div class="graph-stage"><div class="graph-node node-a">A</div><div class="graph-node node-b active">B</div><div class="graph-node node-c">C</div><div class="graph-node node-d">D</div><div class="graph-line line-a"></div><div class="graph-line line-b"></div><div class="graph-line line-c"></div></div><div class="graph-code"><span>queue.push(node)</span><span class="code-highlight">visited.add(next)</span></div></div>`;
  }
  return `<div class="preview-window generic-window"><div class="preview-nav"><span class="preview-logo">project / preview</span></div><div class="generic-lines"><i></i><i></i><i></i></div></div>`;
}

function renderProject() {
  const { project, island } = findProject(state.projectId);
  const projectAction = project.repoUrl
    ? `<a class="primary-action" href="${project.repoUrl}" target="_blank" rel="noreferrer">${project.linkLabel} <span>↗</span></a>`
    : `<button type="button" class="primary-action" disabled>${project.linkLabel} <span>↗</span></button>`;
  document.querySelector('#project-toolbar-meta').textContent = `${island.shortTitle} / PROJECT EXHIBIT`;
  document.querySelector('#project-exhibit').innerHTML = `
    <div class="exhibit-grid" style="--project-color:${project.color}">
      <div class="exhibit-copy">
        <p class="eyebrow">${project.category}</p>
        <h1 id="project-title">${project.title}</h1>
        <p class="exhibit-summary">${project.summary}</p>
        <div class="project-tags">${project.stack.map((tag) => `<span>${tag}</span>`).join('')}</div>
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
  `;
  document.querySelector('#inline-back').addEventListener('click', () => setScreen(closeProject(state)));
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
  context.fillStyle = '#b8d8bd';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.18;
  context.strokeStyle = '#537a69';
  context.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 32) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke();
  }
  for (let y = 0; y < canvas.height; y += 32) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke();
  }
  context.globalAlpha = 1;

  context.fillStyle = '#d7c09f';
  context.beginPath();
  context.moveTo(0, 390); context.bezierCurveTo(180, 300, 230, 420, 355, 345); context.bezierCurveTo(500, 260, 610, 382, 960, 250);
  context.lineWidth = 58; context.strokeStyle = '#d7c09f'; context.stroke();
  context.lineWidth = 42; context.strokeStyle = '#eee0bf'; context.stroke();

  drawRoundedRect(70, 58, 230, 112, 16, '#f4e8d2', '#d5b88f');
  drawRoundedRect(83, 71, 204, 75, 10, '#ffbb78', '#b96652');
  context.fillStyle = '#75495a'; context.font = 'bold 14px ui-monospace, monospace'; context.fillText(currentIsland?.shortTitle ?? 'PROJECTS', 102, 112);
  context.fillStyle = '#fff0cd'; context.font = '11px ui-monospace, monospace'; context.fillText('ARCHIVE HALL', 102, 130);
  context.fillStyle = '#d27e61'; context.fillRect(257, 102, 18, 44);

  const garden = [[430, 75], [470, 104], [785, 110], [730, 188], [90, 255], [165, 470], [830, 430]];
  garden.forEach(([x, y], index) => {
    context.fillStyle = index % 2 ? '#4c8e62' : '#5da66d';
    context.fillRect(x, y, 18, 18); context.fillRect(x + 8, y - 9, 12, 27);
    context.fillStyle = '#3d7b58'; context.fillRect(x - 8, y + 12, 32, 5);
  });

  markerPositions.slice(0, currentIsland?.projects.length ?? 1).forEach((marker, index) => {
    const project = currentIsland?.projects[index];
    if (!project) return;
    context.fillStyle = '#f1ddbb';
    context.beginPath(); context.arc(marker.x, marker.y, 38, 0, Math.PI * 2); context.fill();
    context.fillStyle = project.color;
    context.fillRect(marker.x - 29, marker.y - 25, 58, 50);
    context.fillStyle = '#fff4da'; context.fillRect(marker.x - 23, marker.y - 19, 46, 32);
    context.fillStyle = '#654d67'; context.fillRect(marker.x - 9, marker.y + 13, 18, 12);
    context.fillStyle = '#6d5371'; context.font = 'bold 11px ui-monospace, monospace'; context.textAlign = 'center'; context.fillText(project.title.toUpperCase(), marker.x, marker.y + 52); context.textAlign = 'left';
  });

  const near = getNearestProject();
  if (near) {
    context.globalAlpha = 0.35 + Math.sin(performance.now() / 240) * 0.12;
    context.strokeStyle = islandColor; context.lineWidth = 4; context.beginPath(); context.arc(near.marker.x, near.marker.y, 50, 0, Math.PI * 2); context.stroke(); context.globalAlpha = 1;
  }

  const px = Math.round(player.x); const py = Math.round(player.y);
  context.fillStyle = 'rgba(48, 57, 68, .22)'; context.fillRect(px - 11, py + 14, 22, 6);
  context.fillStyle = '#3f4a58'; context.fillRect(px - 8, py - 7, 16, 24); context.fillRect(px - 12, py - 1, 24, 7);
  context.fillStyle = '#f6c8a7'; context.fillRect(px - 7, py - 18, 14, 12);
  context.fillStyle = '#59415e'; context.fillRect(px - 9, py - 21, 18, 6); context.fillRect(px - 10, py - 16, 4, 5);
  context.fillStyle = '#c7ecdb'; context.fillRect(px - 4, py - 5, 8, 8);
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
document.querySelector('#back-to-island').addEventListener('click', () => setScreen(closeProject(state)));
document.querySelector('#close-project').addEventListener('click', () => setScreen(closeProject(state)));
archiveIndexTrigger.addEventListener('click', openArchiveIndex);
archiveIndexClose.addEventListener('click', closeArchiveIndex);
archiveModal.addEventListener('click', (event) => {
  if (event.target === archiveModal) closeArchiveIndex();
});

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
  if (!archiveModal.classList.contains('is-hidden') && key === 'escape') {
    closeArchiveIndex();
    return;
  }
  if (state.screen === 'island' && key === 'e') {
    const nearest = getNearestProject();
    if (nearest) setScreen(openProject(state, nearest.project.id));
  }
  if (key === 'escape') {
    if (state.screen === 'project') setScreen(closeProject(state));
    else if (state.screen === 'island') setScreen(exitToSky(state));
  }
  pressedKeys.add(key);
});

window.addEventListener('keyup', (event) => pressedKeys.delete(event.key.toLowerCase()));

renderSky();
setScreen(state);
renderArchiveIndex();
loadRepoInventory();
requestAnimationFrame(animate);
