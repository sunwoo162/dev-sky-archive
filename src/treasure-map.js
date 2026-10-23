const SVG_NS = 'http://www.w3.org/2000/svg';

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 760;

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function landmarkArt(landmark) {
  const art = {
    profile: `
      <path d="M-30 24h60v-40L0-45-30-16z" />
      <path d="M-8 24V0h16v24M-24-7h10v10h-10zM14-7h10v10H14z" class="art-detail" />
      <path d="M0-57v12M-7-50H7" class="art-detail" />`,
    personal: `
      <path d="M-32 24h64V-6L0-36-32-6z" />
      <path d="M-10 24V2h20v22M-24-2h12v11h-12zM12-2h12v11H12z" class="art-detail" />
      <path d="M-9-36h18v9H-9z" class="art-detail" />`,
    team: `
      <path d="M-38 24h28v-46l-12-12-16 12zM10 24h28v-46L26-34 10-22z" />
      <path d="M-29-7h10v10h-10zM19-7h10v10H19zM-31 12h14M17 12h14" class="art-detail" />
      <path d="M-44-36h14M30-36h14" class="art-detail" />`,
    external: `
      <path d="M-34 24h68L24-28H-24z" />
      <path d="M-17 24v-38h34v38M-7-14h14v14H-7z" class="art-detail" />
      <path d="M-28-42h56M-22-42v11M22-42v11" class="art-detail" />`,
    study: `
      <path d="M-30 24h60V-39L0-57-30-39z" />
      <path d="M-21-20h42v31h-42zM-12-10h24M-12 0h24" class="art-detail" />
      <path d="M-8-39h16v9H-8z" class="art-detail" />`,
  };

  return art[landmark] ?? art.profile;
}

function decorativeArt() {
  return `
    <g class="treasure-map-decoration treasure-map-decoration--mountains" aria-hidden="true">
      <path d="M110 226 164 146l35 45 47-74 72 109z" />
      <path d="m145 177 19-28 16 24 18-4 27-46 24 37" class="art-detail" />
      <path d="M925 548 971 468l29 38 48-74 61 116z" />
      <path d="m957 505 15-28 19 27 17-4 27-42 19 34" class="art-detail" />
    </g>
    <g class="treasure-map-decoration treasure-map-decoration--palms" aria-hidden="true">
      <path d="M865 142v88M865 151c-26-14-41-9-52 3 22 1 34 9 52 17M865 157c24-21 42-18 54-7-22 7-34 16-54 27M865 154c-8-28 0-42 15-49 3 22-3 35-15 49" />
      <path d="M338 546v79M338 558c-24-11-38-7-49 3 20 2 31 8 49 16M338 565c24-18 39-16 51-6-21 6-32 14-51 23" />
    </g>
    <g class="treasure-map-decoration treasure-map-decoration--clouds" aria-hidden="true">
      <path d="M111 96c10-17 30-20 45-9 15-25 51-14 53 13 24-7 43 8 43 29H95c0-17 3-27 16-33Z" />
      <path d="M955 324c10-17 29-20 44-9 14-22 47-14 51 11 20-5 38 9 38 28H941c0-15 4-24 14-30Z" />
    </g>
    <g class="treasure-map-decoration treasure-map-decoration--waves" aria-hidden="true">
      <path d="M60 377c16-14 32 14 48 0s32 14 48 0 32 14 48 0 32 14 48 0" />
      <path d="M910 666c16-14 32 14 48 0s32 14 48 0 32 14 48 0 32 14 48 0" />
      <path d="M102 650c11-10 22 10 33 0s22 10 33 0 22 10 33 0" />
    </g>
    <g class="treasure-map-compass" transform="translate(1054 612)" aria-label="나침반" role="img">
      <circle r="62" />
      <circle r="51" class="compass-inner" />
      <path d="m0-42 10 42-10 42-10-42z" class="compass-needle" />
      <path d="m-42 0 42-10 42 10-42 10z" class="compass-needle compass-needle--secondary" />
      <text x="0" y="-70">N</text><text x="0" y="87">S</text>
      <text x="73" y="5">E</text><text x="-73" y="5">W</text>
    </g>
  `;
}

function coastArt() {
  return `
    <g class="treasure-map-coasts" aria-hidden="true">
      <path class="treasure-map-coast" d="M92 128c34-26 76-18 102-39 31-25 66-6 91 12 24 18 48 10 71 35 23 25 8 58-21 67-27 8-43-7-68 7-28 15-56 2-83 16-27 14-78 5-91-21-10-20-13-56-1-77Z" />
      <path class="treasure-map-coast" d="M752 92c35-16 66 5 91-9 28-15 52 8 70 28 18 20 44 11 62 39 16 26 0 55-28 59-30 4-39-13-67-4-30 9-55-8-82 2-30 11-64-9-67-36-3-26 3-67 21-79Z" />
      <path class="treasure-map-coast" d="M91 438c25-25 67-16 89-35 27-23 52-2 75 16 21 16 49 6 67 32 19 27 2 55-23 65-29 11-45-5-69 9-31 18-62 3-87 17-29 16-61-7-65-34-5-28-4-52 13-70Z" />
      <path class="treasure-map-coast" d="M756 405c25-24 67-12 92-28 27-17 54 5 77 20 24 16 48 7 73 31 25 24 16 58-13 69-26 10-44-7-70 7-30 16-58 1-85 14-28 13-64-7-72-35-8-27-16-56-2-78Z" />
      <path class="treasure-map-coast-detail" d="M128 177c31-14 47 7 73-11m-15 38c25-17 45 3 69-9m570-70c27-14 46 1 64-11m-12 57c25-13 47 2 67-9M122 483c27-12 46 4 65-8m675-16c27-13 45 3 68-9" />
      <g class="treasure-map-treasure" transform="translate(182 151)"><path d="m0-13 4 9 10 1-8 6 2 10-8-5-8 5 2-10-8-6 10-1z" /><circle r="4" /></g>
      <g class="treasure-map-treasure" transform="translate(1014 465)"><path d="m0-13 4 9 10 1-8 6 2 10-8-5-8 5 2-10-8-6 10-1z" /><circle r="4" /></g>
      <g class="treasure-map-treasure" transform="translate(838 164)"><path d="m0-13 4 9 10 1-8 6 2 10-8-5-8 5 2-10-8-6 10-1z" /><circle r="4" /></g>
    </g>
  `;
}

function routeArt() {
  return `
    <g class="treasure-map-routes" aria-hidden="true">
      <path class="treasure-map-route" d="M600 365 C520 300 420 250 288 220" />
      <path class="treasure-map-route" d="M600 365 C710 302 790 244 912 205" />
      <path class="treasure-map-route" d="M600 365 C505 410 400 465 264 509" />
      <path class="treasure-map-route" d="M600 365 C720 407 814 458 936 486" />
      <circle cx="600" cy="365" r="11" class="route-stop" />
      <circle cx="288" cy="220" r="7" class="route-stop" />
      <circle cx="912" cy="205" r="7" class="route-stop" />
      <circle cx="264" cy="509" r="7" class="route-stop" />
      <circle cx="936" cy="486" r="7" class="route-stop" />
    </g>
  `;
}

function createSvg() {
  return `
    <svg class="treasure-map-svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" role="img" aria-label="프로젝트 보물지도">
      <defs>
        <filter id="treasure-map-paper-noise" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="9" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
          <feComponentTransfer in="mono" result="softNoise">
            <feFuncA type="table" tableValues="0 0.08" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="softNoise" mode="multiply" />
        </filter>
        <pattern id="treasure-map-grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0H0V80" fill="none" stroke="#76523a" stroke-opacity="0.08" stroke-width="1" />
        </pattern>
      </defs>
      <rect class="treasure-map-paper" x="12" y="12" width="1176" height="736" rx="6" filter="url(#treasure-map-paper-noise)" />
      <rect class="treasure-map-grid" x="34" y="34" width="1132" height="692" />
      <rect class="treasure-map-frame" x="34" y="34" width="1132" height="692" rx="3" />
      <path class="treasure-map-frame-inner" d="M52 68V52h16M1132 52h16v16M52 692v16h16M1132 708h16v-16" />
      ${coastArt()}
      ${routeArt()}
      ${decorativeArt()}
    </svg>
  `;
}

function createLandmarks(islands) {
  return islands
    .filter((island) => island.map)
    .map((island) => {
      const { x, y, landmark, label } = island.map;
      const title = escapeText(label);
      return `
        <button class="treasure-map-landmark treasure-map-landmark--${escapeText(landmark)}" type="button" data-island-id="${escapeText(island.id)}" style="--map-x: ${x}%; --map-y: ${y}%" aria-label="${title} 섬 열기">
          <span class="treasure-map-landmark__art" aria-hidden="true">
            <svg viewBox="-52 -70 104 100" focusable="false">${landmarkArt(landmark)}</svg>
          </span>
          <span class="treasure-map-landmark__label">${title}</span>
        </button>
      `;
    })
    .join('');
}

export function renderTreasureMap({ container, islands, onSelect, reducedMotion = false }) {
  if (!container) return null;

  container.innerHTML = `
    <div class="treasure-map-canvas">
      ${createSvg()}
      <div class="treasure-map-landmarks" aria-label="프로젝트 카테고리">
        ${createLandmarks(islands)}
      </div>
      <p class="treasure-map-hint">랜드마크를 선택해 탐방하기</p>
    </div>
  `;

  const handleClick = (event) => {
    const button = event.target.closest('[data-island-id]');
    if (!button || !container.contains(button)) return;
    onSelect?.(button.dataset.islandId);
  };

  container.addEventListener('click', handleClick);

  const api = {
    setReducedMotion(value) {
      container.classList.toggle('is-reduced-motion', Boolean(value));
    },
    refresh() {},
    destroy() {
      container.removeEventListener('click', handleClick);
      container.innerHTML = '';
    },
  };

  api.setReducedMotion(reducedMotion);
  return api;
}
