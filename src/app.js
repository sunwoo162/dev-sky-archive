import {
  closeProject,
  createInitialState,
  enterIsland,
  exitToSky,
  openProject,
} from './game-state.js';
import { findIsland, findProject, islands } from './content.js';
import { assetCatalog, assetUrl } from './asset-catalog.js';
import { renderTreasureMap } from './treasure-map.js?map=etched-v9';

const screens = {
  sky: document.querySelector('#sky-screen'),
  island: document.querySelector('#island-screen'),
  project: document.querySelector('#project-screen'),
};

const topbarMode = document.querySelector('#topbar-mode');
const treasureMap = document.querySelector('#treasure-map');
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
let lastProjectFocusProjectId = null;
let lastProjectFocusSource = 'marker';
let lastMaterialFocus = null;
let player = { x: 480, y: 350 };
const pressedKeys = new Set();
let lastFrame = performance.now();
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = reducedMotionQuery.matches;
const assetImages = new Map();
const assetPatterns = new Map();
let treasureMapApi = null;

reducedMotionQuery.addEventListener?.('change', (event) => {
  prefersReducedMotion = event.matches;
  treasureMapApi?.setReducedMotion(prefersReducedMotion);
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
  topbarMode.textContent = state.screen === 'sky' ? '하늘맵' : state.screen === 'island' ? '2D 탐방 월드' : '프로젝트 전시';

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

function enterSelectedIsland(islandId) {
  player = { x: 480, y: 365 };
  setScreen(enterIsland(state, islandId));
  requestAnimationFrame(() => document.querySelector('#back-to-sky')?.focus());
}

function returnToSky() {
  const previousIslandId = state.islandId;
  setScreen(exitToSky(state));
  requestAnimationFrame(() => treasureMapApi?.focusLandmark(previousIslandId));
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
  document.querySelector('#island-count').textContent = `프로젝트 전시 ${currentIsland.projects.length}개`;
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

document.querySelector('#back-to-sky').addEventListener('click', returnToSky);
document.querySelector('#brand-button').addEventListener('click', returnToSky);
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
  if (state.screen === 'project' && !document.querySelector('#materials-reader')?.classList.contains('is-hidden') && event.key === 'Escape') {
    closeMaterialReader();
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
