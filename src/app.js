import {
  closeProject,
  createInitialState,
  enterIsland,
  exitToSky,
  openProject,
} from './game-state.js';
import { findIsland, findProject, islands } from './content.js?map=etched-v21';
import { assetCatalog, assetUrl } from './asset-catalog.js?map=etched-v23';
import {
  HARBOR_START,
  MUSEUM_DOOR,
  WORLD_SIZE,
  createIslandWorld,
  createMuseumLayout,
  findNearestExhibit,
  getCamera,
  isAtMuseumDoor,
} from './island-world.js';
import { createMuseumGuide } from './museum.js';
import { renderTreasureMap } from './treasure-map.js?map=etched-v18';
import { findShortestPath, getTravelDuration, getTravelTip } from './travel.js';

const screens = {
  sky: document.querySelector('#sky-screen'),
  travel: document.querySelector('#travel-screen'),
  island: document.querySelector('#island-screen'),
  project: document.querySelector('#project-screen'),
};

const topbarMode = document.querySelector('#topbar-mode');
const treasureMap = document.querySelector('#treasure-map');
const travelScreen = document.querySelector('#travel-screen');
const travelAtlasRoute = document.querySelector('#travel-atlas-route');
const travelAtlasStamps = document.querySelector('#travel-atlas-stamps');
const travelRoute = document.querySelector('#travel-route');
const travelKicker = document.querySelector('#travel-kicker');
const travelProgress = document.querySelector('.travel-progress');
const travelProgressFill = document.querySelector('#travel-progress-fill');
const travelProgressLabel = document.querySelector('#travel-progress-label');
const travelProgressPercent = document.querySelector('#travel-progress-percent');
const travelTip = document.querySelector('#travel-tip');
const interactionToast = document.querySelector('#interaction-toast');
const interactionText = document.querySelector('#interaction-text');
const archiveModal = document.querySelector('#archive-index-modal');
const archiveIndexTrigger = document.querySelector('#archive-index-trigger');
const archiveIndexClose = document.querySelector('#archive-index-close');
const archiveIndexMeta = document.querySelector('#archive-index-meta');
const archiveIndexList = document.querySelector('#archive-index-list');
const museumModal = document.querySelector('#museum-modal');
const museumModalClose = document.querySelector('#museum-modal-close');
const museumModalDismiss = document.querySelector('#museum-modal-dismiss');
const museumModalContent = document.querySelector('#museum-modal-content');
const museumOpenProject = document.querySelector('#museum-open-project');
const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');

let state = createInitialState();
let currentIsland = null;
let repoInventory = [];
let lastArchiveFocus = null;
let lastMuseumFocus = null;
let activeMuseumProjectId = null;
let lastProjectFocusProjectId = null;
let lastProjectFocusSource = 'marker';
let lastMaterialFocus = null;
let islandWorld = null;
let museumInterior = false;
let museumExhibits = [];
let camera = { x: 0, y: 0 };
let player = { ...HARBOR_START };
const pressedKeys = new Set();
let lastFrame = performance.now();
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = reducedMotionQuery.matches;
const assetImages = new Map();
const assetPatterns = new Map();
let treasureMapApi = null;
let currentMapLocationId = null;
let activeTravel = null;
let travelStartedAt = 0;
let selectionTransitionLocked = false;

reducedMotionQuery.addEventListener?.('change', (event) => {
  prefersReducedMotion = event.matches;
  treasureMapApi?.setReducedMotion(prefersReducedMotion);
});

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
  topbarMode.textContent = state.screen === 'sky' ? '하늘맵' : state.screen === 'travel' ? '항해 중' : state.screen === 'island' ? '2D 탐방 월드' : '프로젝트 전시';

  if (state.screen === 'island') renderIsland();
  if (state.screen === 'project') renderProject();
  if (state.screen === 'sky') requestAnimationFrame(() => treasureMapApi?.refresh());
}

const classificationLabels = {
  'candidate-project': '주요 프로젝트 후보',
  'learning-log': '학습 기록',
  tooling: '도구 / 자동화',
  'profile-tooling': '프로필 도구',
  sandbox: '실험 프로젝트',
  'dependency-or-study': '스터디 / 의존성',
  'empty-or-placeholder': '비어 있음 / 자리표시자',
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
    archiveIndexMeta.textContent = '인벤토리를 불러오지 못함 / 탐방 맵은 계속 사용 가능';
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

  archiveIndexMeta.textContent = `레포지토리 ${repoInventory.length}개 / 카테고리 ${orderedGroups.length}개 / 읽기 전용`;
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

function renderMuseumGuide(project, island) {
  const guide = createMuseumGuide(project);
  return `
    <div class="museum-guide-hero">
      <div>
        <span class="museum-guide-kicker">${escapeHtml(island?.shortTitle ?? 'PROJECT')} / FRONTEND FIELD NOTE</span>
        <h3>${escapeHtml(guide.title)}</h3>
        <p>${escapeHtml(guide.summary)}</p>
      </div>
      <span class="museum-guide-stamp">EXHIBIT<br />NOTE</span>
    </div>
    <div class="museum-guide-grid">
      <section class="museum-guide-card"><span>사용 기술</span><strong>${escapeHtml(guide.stack)}</strong></section>
      <section class="museum-guide-card"><span>내 역할</span><strong>${escapeHtml(guide.role)}</strong></section>
      <section class="museum-guide-card museum-guide-card--wide"><span>프론트엔드 흐름</span><strong>${escapeHtml(guide.flow)}</strong></section>
      <section class="museum-guide-card museum-guide-card--wide"><span>개발 기록</span><strong>${escapeHtml(guide.timeline)}</strong></section>
    </div>
    <p class="museum-guide-detail">${escapeHtml(guide.detail)}</p>
    <p class="museum-guide-prompt"><span>탐방 안내</span>${escapeHtml(guide.prompt)}</p>
  `;
}

function openMuseumGuide(projectId, trigger = document.activeElement) {
  if (!museumModal || !museumModalContent) return;
  const { project, island } = findProject(projectId);
  if (!project) return;
  lastMuseumFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
  activeMuseumProjectId = project.id;
  museumModalContent.innerHTML = renderMuseumGuide(project, island);
  museumModal.classList.remove('is-hidden');
  museumModal.setAttribute('aria-hidden', 'false');
  museumOpenProject?.focus();
}

function closeMuseumGuide({ restoreFocus = true } = {}) {
  if (!museumModal) return;
  museumModal.classList.add('is-hidden');
  museumModal.setAttribute('aria-hidden', 'true');
  const focusTarget = lastMuseumFocus;
  lastMuseumFocus = null;
  activeMuseumProjectId = null;
  if (restoreFocus && focusTarget instanceof HTMLElement) focusTarget.focus();
}

function openProjectFromMuseum() {
  const projectId = activeMuseumProjectId;
  closeMuseumGuide({ restoreFocus: false });
  if (projectId) openProjectFromControl(projectId, 'marker');
}

function trapMuseumFocus(event) {
  if (!museumModal) return;
  const focusable = [...museumModal.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
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
  if (projectFocusTarget) projectFocusTarget.focus();
  else canvas.focus();
}

function renderTravel(plan) {
  const routeIslands = plan.path.map((id) => findIsland(id)).filter(Boolean);
  const hopCount = Math.max(0, plan.path.length - 1);
  const destination = routeIslands.at(-1);
  const routePoints = routeIslands.map((island) => `${island.map.x},${island.map.y}`).join(' ');
  const routeMode = destination?.map?.target === 'ship'
    ? '해상 항로'
    : destination?.map?.target === 'castle'
      ? '육상 항로'
      : destination?.map?.target === 'settlement'
        ? '정착지 항로'
        : '중심 항로';
  travelScreen.classList.remove('travel-screen--ship', 'travel-screen--castle', 'travel-screen--settlement', 'travel-screen--island');
  travelScreen.classList.add(`travel-screen--${destination?.map?.target ?? 'island'}`);
  travelAtlasRoute.setAttribute('points', routePoints);
  travelAtlasStamps.innerHTML = routeIslands.map((island, index) => `
    <g class="travel-atlas-stamp ${index === 0 ? 'is-origin' : ''} ${index === routeIslands.length - 1 ? 'is-destination' : ''}" transform="translate(${island.map.x} ${island.map.y})">
      <circle class="travel-atlas-stamp-ring" r="2.7"></circle>
      <circle class="travel-atlas-stamp-dot" r=".9"></circle>
      <text x="0" y="-4.4">${index === 0 ? 'FROM' : index === routeIslands.length - 1 ? 'TO' : String(index).padStart(2, '0')}</text>
    </g>
  `).join('');
  travelRoute.innerHTML = routeIslands.map((island, index) => `
    ${index ? '<span class="travel-route-arrow" aria-hidden="true">→</span>' : ''}
    <span class="travel-route-node travel-route-node--${escapeHtml(island.map.target)} ${index === 0 ? 'is-origin' : ''} ${index === routeIslands.length - 1 ? 'is-destination' : ''}"><i aria-hidden="true"></i>${escapeHtml(island.title)}</span>
  `).join('');
  travelScreen.querySelector('#travel-title').innerHTML = `<span>${escapeHtml(destination?.title ?? '목적지')}</span><em>로 이동 중</em>`;
  travelScreen.querySelector('#travel-status').textContent = `${routeMode} · ${(plan.duration / 1000).toFixed(1)}초`;
  travelKicker.textContent = `${routeMode} · 지도 위 최단 경로를 따라 이동하는 중`;
  travelProgressLabel.textContent = `최단 경로 ${hopCount.toString().padStart(2, '0')} / ${hopCount.toString().padStart(2, '0')}`;
  travelProgressPercent.textContent = '0%';
  travelProgressFill.style.width = '0%';
  travelProgress.setAttribute('aria-valuenow', '0');
  travelTip.textContent = plan.tip;
  travelScreen.setAttribute('aria-busy', 'true');
}

function finishTravel() {
  if (!activeTravel) return;
  const destinationId = activeTravel.destinationId;
  activeTravel = null;
  travelScreen.setAttribute('aria-busy', 'false');
  currentMapLocationId = destinationId;
  islandWorld = null;
  player = { ...HARBOR_START };
  museumInterior = false;
  museumExhibits = [];
  setScreen(enterIsland(state, destinationId));
  requestAnimationFrame(() => document.querySelector('#back-to-sky')?.focus());
}

function updateTravelProgress(timestamp) {
  if (state.screen !== 'travel' || !activeTravel) return;
  const duration = prefersReducedMotion ? 0 : activeTravel.duration;
  const progress = duration ? Math.min(1, (timestamp - travelStartedAt) / duration) : 1;
  const percent = Math.round(progress * 100);
  travelProgressFill.style.width = `${percent}%`;
  travelProgressPercent.textContent = `${percent}%`;
  travelProgress.setAttribute('aria-valuenow', String(percent));
  travelProgressLabel.textContent = progress >= 1
    ? '목적지 도착'
    : `최단 경로 ${Math.max(1, Math.ceil(progress * activeTravel.hops)).toString().padStart(2, '0')} / ${activeTravel.hops.toString().padStart(2, '0')}`;
  if (progress >= 1) finishTravel();
}

function enterSelectedIsland(islandId) {
  if (selectionTransitionLocked || activeTravel) return;
  selectionTransitionLocked = true;
  const destination = findIsland(islandId);
  if (!destination) {
    selectionTransitionLocked = false;
    return;
  }
  const path = currentMapLocationId ? findShortestPath(currentMapLocationId, islandId) : [islandId];
  if (path.length <= 1) {
    selectionTransitionLocked = false;
    currentMapLocationId = islandId;
    islandWorld = null;
    player = { ...HARBOR_START };
    museumInterior = false;
    museumExhibits = [];
    setScreen(enterIsland(state, islandId));
    requestAnimationFrame(() => document.querySelector('#back-to-sky')?.focus());
    return;
  }

  activeTravel = {
    path,
    destinationId: islandId,
    hops: path.length - 1,
    duration: getTravelDuration(path),
    tip: getTravelTip(destination),
  };
  setScreen({ ...state, screen: 'travel', islandId: null, projectId: null });
  renderTravel(activeTravel);
  travelStartedAt = performance.now();
  selectionTransitionLocked = false;
}

function returnToSky() {
  const previousIslandId = state.islandId ?? currentMapLocationId;
  if (state.islandId) currentMapLocationId = state.islandId;
  setScreen(exitToSky(state));
  requestAnimationFrame(() => previousIslandId && treasureMapApi?.focusLandmark(previousIslandId));
}

function renderIsland() {
  currentIsland = findIsland(state.islandId);
  if (!islandWorld || islandWorld.id !== currentIsland.id) {
    islandWorld = createIslandWorld(currentIsland);
    player = { ...islandWorld.start };
    museumInterior = false;
    museumExhibits = [];
  }
  document.querySelector('#island-eyebrow').textContent = `${currentIsland.index} / ${currentIsland.title}`;
  const islandTitle = document.querySelector('#island-title');
  if (islandTitle) islandTitle.textContent = currentIsland.title;
  document.querySelector('#island-screen').style.setProperty('--island-accent', currentIsland.color);
  updateWorldHud();
  updateInteraction();
}

function visualMarkup(project) {
  if (project.visual === 'archive') {
        return `<div class="preview-window archive-window"><div class="preview-nav"><span class="preview-logo">dev-sky-archive / map</span><span class="archive-live">● PLAYABLE</span></div><div class="archive-stage"><div class="archive-route archive-route-one"></div><div class="archive-route archive-route-two"></div><i class="archive-island archive-island-one">01</i><i class="archive-island archive-island-two">02</i><i class="archive-island archive-island-three">03</i><span class="archive-player">YOU</span></div><div class="archive-caption">treasure map → 2D island → exhibit</div></div>`;
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
    <button class="material-card material-${material.kind.toLowerCase()}" type="button" data-material-kind="${material.kind}" aria-controls="materials-reader" aria-expanded="false" aria-label="${escapeHtml(material.title)} 문서 열기">
       <div class="material-art" aria-hidden="true"><img src="${assetUrl(materialAssetMap[material.kind] ?? 'project-screen')}" alt="" /><span>${material.kind} / ${String(index + 1).padStart(2, '0')}</span><b>실제 자료로 교체</b></div>
       <div class="material-card-head"><span>${material.label}</span><em>임시</em></div>
      <h3>${material.title}</h3>
      <p>${material.description}</p>
      <small>${material.format} · 문서 열기 ↗</small>
    </button>
  `).join('');
}

const materialDrafts = {
  SCREEN: {
    eyebrow: 'SCREEN / 화면 기록',
    lead: '최종 화면과 실제 사용 흐름을 보여주는 자료를 넣는 문서입니다.',
    sections: [
      ['넣을 자료', '대표 화면 캡처, 짧은 GIF, 반응형 화면 또는 Figma 링크'],
      ['정리 방식', '문제 상황 → 핵심 화면 → 인터랙션 결과 순서로 3~5개의 장면을 배치'],
    ],
  },
  SYSTEM: {
    eyebrow: 'SYSTEM / 구조 기록',
    lead: '컴포넌트, 상태, 데이터 흐름을 읽을 수 있게 정리하는 문서입니다.',
    sections: [
      ['넣을 자료', '컴포넌트 트리, 상태 전이, API 또는 데이터 모델 다이어그램'],
      ['정리 방식', '입력 → 상태 변화 → 화면 출력과 각 경계의 책임을 짧게 설명'],
    ],
  },
  ROLE: {
    eyebrow: 'ROLE / 역할 기록',
    lead: '프로젝트에서 실제로 맡은 범위를 근거와 함께 적는 문서입니다.',
    sections: [
      ['넣을 자료', '담당 화면, PR, 커밋, 이슈, 협업 메모와 같은 역할 증빙'],
      ['정리 방식', '내가 결정한 것 → 구현한 것 → 협업으로 조정한 것을 구분'],
    ],
  },
  EVIDENCE: {
    eyebrow: 'EVIDENCE / 근거 기록',
    lead: 'README, 배포 링크, 테스트 결과처럼 프로젝트를 확인할 수 있는 자료입니다.',
    sections: [
      ['넣을 자료', 'GitHub 링크, 배포 주소, 테스트 명령, 성능 지표, 릴리스 기록'],
      ['정리 방식', '주장 하나마다 확인 가능한 링크나 파일 경로를 붙여 신뢰도를 보강'],
    ],
  },
  PORTFOLIO: {
    eyebrow: 'PORTFOLIO / 포트폴리오 원고',
    lead: '프로젝트를 문제·해결·결과의 흐름으로 설명하는 최종 케이스 스터디입니다.',
    sections: [
      ['넣을 자료', '문제 정의, 선택한 해결책, 구현 과정, 결과와 배운 점'],
      ['정리 방식', '한 문단에 한 메시지만 남기고 화면·근거 자료와 연결'],
    ],
  },
  SELFINTRO: {
    eyebrow: 'SELFINTRO / 자기소개서 원고',
    lead: '이 프로젝트에서 드러난 강점과 성장 경험을 지원 문장으로 정리하는 문서입니다.',
    sections: [
      ['넣을 자료', '지원 직무에 맞춘 자기소개 문장, 회고, 배운 점'],
      ['정리 방식', '상황 → 행동 → 결과 → 다음에 적용할 점을 짧게 연결'],
    ],
  },
  PROJECT: {
    eyebrow: 'PROJECT / 프로젝트 설명',
    lead: '면접이나 발표에서 이 프로젝트를 빠르게 설명하기 위한 원고입니다.',
    sections: [
      ['넣을 자료', '한 줄 소개, 1분 설명, 기술 선택 이유, 예상 질문 답변'],
      ['정리 방식', '왜 만들었는지부터 무엇을 만들었고 내가 무엇을 했는지 순서로 설명'],
    ],
  },
  OTHER: {
    eyebrow: 'OTHER / 기타 기록',
    lead: '이력서, 발표 자료, 회고, 인증서처럼 다른 문서와 연결하는 자리입니다.',
    sections: [
      ['넣을 자료', 'PDF, 슬라이드, 회고, 인증서, 외부 링크'],
      ['정리 방식', '자료의 용도와 연결된 프로젝트 맥락을 한 줄로 덧붙임'],
    ],
  },
};

function renderMaterialReader(project, material) {
  const draft = materialDrafts[material.kind] ?? materialDrafts.OTHER;
  const timeline = project.timeline.slice(0, 3).map((entry) => `<li><span>${escapeHtml(entry.phase)}</span><strong>${escapeHtml(entry.title)}</strong></li>`).join('');
  return `
    <div class="material-reader-head">
      <div><span class="material-reader-kicker">문서 미리보기 / TEMP DRAFT</span><h3 id="materials-reader-title">${escapeHtml(material.title)}</h3></div>
      <button class="material-reader-close" id="material-reader-close" type="button">닫기 <span>Esc</span></button>
    </div>
    <div class="material-reader-meta"><span>${escapeHtml(draft.eyebrow)}</span><span>${escapeHtml(material.format)}</span><em>임시 초안</em></div>
    <div class="material-reader-grid">
      <div class="material-reader-copy">
        <p class="material-reader-lead">${escapeHtml(draft.lead)}</p>
        <p>${escapeHtml(project.title)}의 현재 기록과 연결된 자료 자리입니다. 실제 원고나 파일이 들어오면 이 임시 안내문을 교체합니다.</p>
        <div class="material-reader-sections">${draft.sections.map(([title, copy]) => `<section><span>${escapeHtml(title)}</span><p>${escapeHtml(copy)}</p></section>`).join('')}</div>
      </div>
      <aside class="material-reader-context">
        <span>현재 프로젝트 기록</span>
        <strong>${escapeHtml(project.summary)}</strong>
        <small>기술 스택 / ${escapeHtml(project.stack.join(' · '))}</small>
        <ul>${timeline}</ul>
      </aside>
    </div>
    <p class="material-reader-note"><b>실제 자료로 교체</b> 네 문서·캡처·링크를 받으면 이 카드의 임시 초안과 연결 정보만 교체하면 됩니다. 현재 내용은 구조 확인용입니다.</p>
  `;
}

function closeMaterialReader() {
  const reader = document.querySelector('#materials-reader');
  if (!reader) return;
  reader.classList.add('is-hidden');
  reader.setAttribute('aria-hidden', 'true');
  document.querySelectorAll('[data-material-kind]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
  if (lastMaterialFocus instanceof HTMLElement) lastMaterialFocus.focus();
}

function openMaterialReader(project, material, button) {
  const reader = document.querySelector('#materials-reader');
  if (!reader || !material) return;
  lastMaterialFocus = button;
  reader.innerHTML = renderMaterialReader(project, material);
  reader.classList.remove('is-hidden');
  reader.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('[data-material-kind]').forEach((card) => card.setAttribute('aria-expanded', card === button ? 'true' : 'false'));
  reader.querySelector('#material-reader-close')?.focus();
  reader.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
}

function renderProject() {
  const { project, island } = findProject(state.projectId);
  const projectAction = project.repoUrl
    ? `<a class="primary-action" href="${project.repoUrl}" target="_blank" rel="noreferrer">${project.linkLabel} <span>↗</span></a>`
    : `<button type="button" class="primary-action" disabled>${project.linkLabel} <span>↗</span></button>`;
  const roleStatusLabel = project.roleStatus === 'needs-confirmation' ? '확인 필요' : '직접 기록';
  const categoryNames = { PROFILE: '프로필', PERSONAL: '개인 프로젝트', TEAM: '팀 프로젝트', EXTERNAL: '대외활동', STUDY: '스터디', MATERIALS: '자료', WORK: '작업' };
  const categoryLabel = project.category.split(' / ').map((token, index) => index === 0 ? (categoryNames[token] ?? token) : token).join(' / ');
  document.querySelector('#project-toolbar-meta').textContent = `${island.shortTitle} / 프로젝트 전시`;
  document.querySelector('#project-exhibit').innerHTML = `
    <div class="exhibit-grid" style="--project-color:${project.color}">
      <div class="exhibit-copy">
        <p class="eyebrow">${categoryLabel}</p>
        <h1 id="project-title">${project.title}</h1>
        <p class="exhibit-summary">${project.summary}</p>
        <div class="project-tags">${project.stack.map((tag) => `<span>${tag}</span>`).join('')}</div>
        <div class="exhibit-meta"><span><b>레포지토리</b>${project.repo}</span><span><b>상태</b>${project.status}</span><span><b>역할 확실성</b>${roleStatusLabel}</span></div>
        <div class="exhibit-actions">${projectAction}<button type="button" class="text-action" id="inline-back">전시로 돌아가기</button></div>
      </div>
       <div class="exhibit-visual-wrap"><div class="visual-kicker"><span>인터랙티브 케이스 뷰</span><span>01 / 04</span></div>${visualMarkup(project)}<div class="visual-shadow"></div></div>
      <div class="exhibit-dossier">
         <div class="dossier-label">프로젝트 기록</div>
         <div class="dossier-block"><span>내 역할</span><strong>${project.role}</strong></div>
         <div class="dossier-block"><span>진행 흐름</span><div class="flow-list">${project.flow.map((step, index) => `<div><i>0${index + 1}</i><b>${step}</b>${index < project.flow.length - 1 ? '<span class="flow-arrow">→</span>' : ''}</div>`).join('')}</div></div>
         <div class="dossier-block dossier-timeline"><span>개발 로그</span><div class="timeline-list">${project.timeline.map((entry) => `<article class="timeline-item"><span class="timeline-phase">${entry.phase}</span><div><strong>${entry.title}</strong><p>${entry.detail}</p></div></article>`).join('')}</div><small class="timeline-source">출처 / ${project.detailSource}</small></div>
         <div class="dossier-block dossier-note"><span>만든 이유</span><p>${project.detail}</p></div>
      </div>
    </div>
    <section class="exhibit-materials" aria-labelledby="materials-title">
      <div class="materials-heading">
         <div><span class="materials-kicker">포트폴리오 자료 / 임시 보관함</span><h2 id="materials-title">자료 보관함</h2></div>
         <span class="materials-status">자료 자리 ${project.materials.length}개 / 나중에 교체</span>
      </div>
      <p class="materials-intro">포트폴리오, 자기소개서, 프로젝트 설명, 기타 증빙 자료가 들어갈 자리를 먼저 만들어뒀습니다. 지금은 화면 구조를 확인하기 위한 임시 카드입니다.</p>
      <div class="materials-grid">${renderMaterials(project)}</div>
      <div class="materials-reader is-hidden" id="materials-reader" aria-hidden="true" aria-live="polite" aria-labelledby="materials-reader-title"></div>
    </section>
  `;
  document.querySelector('#inline-back').addEventListener('click', closeProjectToIsland);
  document.querySelectorAll('[data-material-kind]').forEach((button) => {
    button.addEventListener('click', () => {
      const material = project.materials.find((item) => item.kind === button.dataset.materialKind);
      openMaterialReader(project, material, button);
    });
  });
}

function drawCanvasLabel(label, x, y, color = '#f5d985', size = 18) {
  context.font = `700 ${size}px ui-monospace, SFMono-Regular, Consolas, monospace`;
  const width = context.measureText(label).width + 28;
  context.fillStyle = 'rgba(35, 43, 61, .88)';
  context.fillRect(x - width / 2, y - size - 12, width, size + 22);
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.strokeRect(x - width / 2, y - size - 12, width, size + 22);
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, x, y - size / 2 - 1);
  context.textAlign = 'start';
  context.textBaseline = 'alphabetic';
}

function drawWindingRoad() {
  context.beginPath();
  context.moveTo(1200, 1400);
  context.bezierCurveTo(1050, 1220, 1450, 1100, 1220, 940);
  context.bezierCurveTo(930, 740, 1100, 620, 1200, 450);
  const pathPattern = assetPatterns.get('path');
  context.lineCap = 'square';
  context.lineWidth = 178;
  context.strokeStyle = pathPattern ?? '#dbc18b';
  context.stroke();
  context.lineWidth = 146;
  context.strokeStyle = '#ead6a2';
  context.stroke();
  context.lineCap = 'butt';
}

function drawExteriorWorld() {
  const grassPattern = assetPatterns.get('grass');
  context.fillStyle = grassPattern ?? '#9acb82';
  context.fillRect(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);

  context.fillStyle = '#86b873';
  context.fillRect(0, 0, WORLD_SIZE.width, 54);
  drawWindingRoad();

  const waterPattern = assetPatterns.get('water');
  context.fillStyle = waterPattern ?? '#6ca7bd';
  context.fillRect(0, 1280, WORLD_SIZE.width, 320);
  context.fillStyle = 'rgba(185, 224, 211, .55)';
  for (let y = 1310; y < 1590; y += 48) {
    for (let x = (y / 48) % 2 ? 40 : 160; x < WORLD_SIZE.width; x += 300) context.fillRect(x, y, 84, 5);
  }

  drawAsset('harbor-dock', 1020, 1235, 360, 150);
  drawAsset('harbor-boat', 540, 1245, 190, 120);
  drawAsset('harbor-boat', 1650, 1280, 190, 120);
  drawCanvasLabel('항구 · START', 1200, 1480, '#f5d985', 19);

  drawAsset('museum-grand', 990, 70, 420, 300);
  drawCanvasLabel('PROJECT MUSEUM', 1200, 420, '#f5d985', 22);
  drawAsset('sky-tree', 470, 390, 84, 116);
  drawAsset('sky-tree', 1845, 390, 84, 116);
  drawAsset('sky-tree', 660, 570, 63, 87);
  drawAsset('sky-tree', 1730, 570, 63, 87);
  drawAsset('sky-lamp', 840, 445, 48, 84);
  drawAsset('sky-lamp', 1565, 445, 48, 84);
  drawAsset('sky-lamp', 930, 710, 48, 84);
  drawAsset('sky-lamp', 1470, 710, 48, 84);
  drawAsset('archive-npc', 1124, 500, 72, 96);
  drawCanvasLabel('안내 데스크', 1160, 618, '#f7e6a4', 14);

  context.fillStyle = 'rgba(55, 76, 74, .25)';
  context.fillRect(1150, 1244, 100, 7);
}

function drawMuseumInterior() {
  context.fillStyle = '#20283a';
  context.fillRect(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);
  const wallPattern = assetPatterns.get('wall');
  context.fillStyle = wallPattern ?? '#536070';
  context.fillRect(70, 70, WORLD_SIZE.width - 140, WORLD_SIZE.height - 140);
  context.fillStyle = '#b7976b';
  context.fillRect(150, 150, WORLD_SIZE.width - 300, WORLD_SIZE.height - 300);
  context.fillStyle = '#d9c48b';
  context.fillRect(190, 190, WORLD_SIZE.width - 380, WORLD_SIZE.height - 380);
  for (let y = 210; y < 1390; y += 80) {
    for (let x = 210; x < 2190; x += 80) {
      context.fillStyle = ((x + y) / 80) % 2 ? 'rgba(112, 82, 73, .07)' : 'rgba(255, 244, 186, .1)';
      context.fillRect(x, y, 78, 78);
    }
  }
  context.strokeStyle = 'rgba(107, 78, 69, .25)';
  context.lineWidth = 2;
  for (let y = 210; y < 1390; y += 80) {
    context.beginPath();
    context.moveTo(210, y);
    context.lineTo(2190, y);
    context.stroke();
  }
  for (let x = 210; x < 2190; x += 80) {
    context.beginPath();
    context.moveTo(x, 210);
    context.lineTo(x, 1390);
    context.stroke();
  }
  context.strokeStyle = '#876b59';
  context.lineWidth = 10;
  context.strokeRect(190, 190, WORLD_SIZE.width - 380, WORLD_SIZE.height - 380);

  context.fillStyle = 'rgba(71, 52, 64, .24)';
  context.fillRect(1010, 260, 380, 1060);
  context.fillStyle = '#f1dda0';
  context.fillRect(1110, 260, 180, 1060);
  context.fillStyle = '#c56763';
  context.fillRect(1190, 260, 20, 1060);
  context.fillStyle = '#eacb7b';
  for (let y = 280; y < 1300; y += 94) {
    context.fillRect(1160, y, 80, 5);
    context.fillRect(1178, y + 13, 44, 5);
  }

  drawAsset('museum-banner', 1020, 42, 360, 168);
  drawCanvasLabel('PROJECT MUSEUM · COLLECTION HALL', 1200, 238, '#5d4662', 20);
  drawAsset('museum-pillar', 250, 190, 92, 232);
  drawAsset('museum-pillar', 2058, 190, 92, 232);
  drawAsset('museum-pillar', 250, 1160, 92, 232);
  drawAsset('museum-pillar', 2058, 1160, 92, 232);
  drawAsset('museum-lamp', 540, 240, 96, 132);
  drawAsset('museum-lamp', 1764, 240, 96, 132);
  drawAsset('museum-lamp', 540, 970, 96, 132);
  drawAsset('museum-lamp', 1764, 970, 96, 132);

  const wallFrames = [
    [390, 270, '#c15f5c'], [710, 270, '#5f7890'], [1490, 270, '#c49459'], [1810, 270, '#706184'],
    [390, 1010, '#5f7890'], [1810, 1010, '#c15f5c'],
  ];
  wallFrames.forEach(([x, y, accent]) => {
    context.fillStyle = '#55445a';
    context.fillRect(x, y, 170, 132);
    context.fillStyle = '#e7d49a';
    context.fillRect(x + 10, y + 10, 150, 112);
    context.fillStyle = accent;
    context.fillRect(x + 25, y + 25, 120, 82);
    context.fillStyle = 'rgba(255, 243, 187, .65)';
    context.fillRect(x + 42, y + 44, 86, 8);
    context.fillRect(x + 57, y + 61, 56, 8);
  });

  context.fillStyle = '#b65558';
  context.fillRect(1160, 1428, 80, 32);
  context.fillStyle = '#e6c879';
  context.fillRect(1140, 1460, 120, 12);
  context.fillStyle = '#fff1b6';
  context.fillRect(1180, 1440, 40, 8);
  museumExhibits.forEach((exhibit) => {
    drawAsset('museum-exhibit', exhibit.x - 65, exhibit.y - 58, 130, 116);
    drawCanvasLabel(exhibit.title, exhibit.x, exhibit.y + 100, exhibit.color ?? '#5d4662', 16);
  });
  drawCanvasLabel('↓ 항구로 돌아가기', 1200, 1510, '#5d4662', 15);

  const near = getNearestProject();
  if (near) {
    context.globalAlpha = prefersReducedMotion ? 0.45 : 0.38 + Math.sin(performance.now() / 220) * 0.14;
    context.strokeStyle = near.project.color ?? currentIsland?.color ?? '#7234e0';
    context.lineWidth = 6;
    context.beginPath();
    context.arc(near.exhibit.x, near.exhibit.y + 16, 84, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = 1;
  }
}

function drawMap() {
  if (!islandWorld) return;
  const viewport = { width: canvas.width, height: canvas.height };
  camera = getCamera(player, viewport, WORLD_SIZE);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(-camera.x, -camera.y);
  if (museumInterior) drawMuseumInterior();
  else drawExteriorWorld();
  const px = Math.round(player.x); const py = Math.round(player.y);
  drawAsset('player', px - 32, py - 43, 64, 85);
  context.restore();
}

function getNearestProject() {
  if (!museumInterior || !currentIsland) return null;
  const exhibit = findNearestExhibit(player, museumExhibits, 150);
  return exhibit ? { project: exhibit, exhibit, distance: exhibit.distance } : null;
}

function updateWorldHud() {
  const location = document.querySelector('#world-location');
  const coordinates = document.querySelector('#mini-coords');
  if (location) location.textContent = museumInterior ? '박물관 · COLLECTION HALL' : '항구 · 선착장';
  if (coordinates) coordinates.textContent = `X ${Math.round(player.x / 10)} / Y ${Math.round(player.y / 10)}`;
}

function updateInteraction() {
  const nearest = getNearestProject();
  const visible = Boolean(nearest);
  interactionToast.classList.toggle('is-visible', visible);
  if (nearest) interactionText.textContent = `${nearest.project.title} 문서 확인`;
  updateWorldHud();
}

function enterMuseum() {
  if (museumInterior || !currentIsland) return;
  museumInterior = true;
  museumExhibits = createMuseumLayout(currentIsland.projects);
  player = { x: 1200, y: 1280 };
  updateInteraction();
}

function exitMuseum() {
  if (!museumInterior) return;
  museumInterior = false;
  museumExhibits = [];
  player = { x: MUSEUM_DOOR.x, y: MUSEUM_DOOR.y + 92 };
  updateInteraction();
}

function worldPointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: camera.x + ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: camera.y + ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function handleWorldClick(event) {
  if (!museumInterior || !museumExhibits.length) return;
  const point = worldPointFromEvent(event);
  const exhibit = findNearestExhibit(point, museumExhibits, 125);
  if (exhibit) openMuseumGuide(exhibit.id, canvas);
}

function movePlayer(delta) {
  if (state.screen !== 'island' || !islandWorld || (museumModal && !museumModal.classList.contains('is-hidden'))) return;
  const direction = { x: 0, y: 0 };
  if (pressedKeys.has('w') || pressedKeys.has('arrowup')) direction.y -= 1;
  if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) direction.y += 1;
  if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) direction.x -= 1;
  if (pressedKeys.has('d') || pressedKeys.has('arrowright')) direction.x += 1;
  const magnitude = Math.hypot(direction.x, direction.y) || 1;
  const speed = 260;
  player.x = Math.max(80, Math.min(WORLD_SIZE.width - 80, player.x + (direction.x / magnitude) * speed * delta));
  player.y = Math.max(80, Math.min(WORLD_SIZE.height - 80, player.y + (direction.y / magnitude) * speed * delta));
  if (!museumInterior && isAtMuseumDoor(player)) {
    enterMuseum();
    updateInteraction();
    return;
  }
  if (museumInterior && player.y > 1470 && Math.abs(player.x - MUSEUM_DOOR.x) < 150) exitMuseum();
  updateInteraction();
}

function animate(timestamp) {
  const delta = Math.min((timestamp - lastFrame) / 1000, 0.05);
  lastFrame = timestamp;
  movePlayer(delta);
  if (state.screen === 'island') drawMap();
  if (state.screen === 'travel') updateTravelProgress(timestamp);
  requestAnimationFrame(animate);
}

document.querySelector('#back-to-sky')?.addEventListener('click', returnToSky);
document.querySelector('#brand-button').addEventListener('click', returnToSky);
document.querySelector('#back-to-island').addEventListener('click', closeProjectToIsland);
document.querySelector('#close-project').addEventListener('click', closeProjectToIsland);
archiveIndexTrigger.addEventListener('click', openArchiveIndex);
archiveIndexClose.addEventListener('click', closeArchiveIndex);
archiveModal.addEventListener('click', (event) => {
  if (event.target === archiveModal) closeArchiveIndex();
});
museumModalClose?.addEventListener('click', closeMuseumGuide);
museumModalDismiss?.addEventListener('click', closeMuseumGuide);
museumOpenProject?.addEventListener('click', openProjectFromMuseum);
museumModal?.addEventListener('click', (event) => {
  if (event.target === museumModal) closeMuseumGuide();
});
canvas.addEventListener('click', handleWorldClick);

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
  if (state.screen === 'project' && !document.querySelector('#materials-reader')?.classList.contains('is-hidden') && event.key === 'Escape') {
    closeMaterialReader();
    return;
  }
  if (museumModal && !museumModal.classList.contains('is-hidden')) {
    if (key === 'escape') {
      closeMuseumGuide();
      return;
    }
    if (key === 'tab') {
      trapMuseumFocus(event);
      return;
    }
    return;
  }
  if (state.screen === 'island' && key === 'j') {
    const nearest = getNearestProject();
    if (nearest) openMuseumGuide(nearest.project.id);
    return;
  }
  if (state.screen === 'island' && key === 'e') {
    const nearest = getNearestProject();
    if (nearest) openProjectFromControl(nearest.project.id);
  }
  if (key === 'escape') {
    if (state.screen === 'project') closeProjectToIsland();
    else if (state.screen === 'island') returnToSky();
  }
  pressedKeys.add(key);
});

window.addEventListener('keyup', (event) => pressedKeys.delete(event.key.toLowerCase()));

treasureMapApi = renderTreasureMap({
  container: treasureMap,
  islands,
  reducedMotion: prefersReducedMotion,
  onSelect: enterSelectedIsland,
});
setScreen(state);
renderArchiveIndex();
loadRepoInventory();
preloadAssets();
requestAnimationFrame(animate);
