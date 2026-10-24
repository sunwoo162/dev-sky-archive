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
      <g class="landmark-ink">
        <path class="landmark-fill" d="M-38 26h76V-8L0-47-38-8z" />
        <path d="M-25-13 0-38 25-13M-18 26V4h36v22M-7 26V8h14v18M-27-7h10v10h-10zM17-7h10v10H17z" class="art-detail" />
        <path d="M0-47v-17M-9-59H9M0-64l5 5-5 5-5-5z" class="art-detail" />
      </g>`,
    personal: `
      <g class="landmark-ink">
        <path class="landmark-fill" d="M-38 26h76V-3L0-39-38-3z" />
        <path d="M-27-6 0-31 27-6M-16 26V5h32v21M-7 5h14v12H-7zM-29 1h11v10h-11zM18 1h11v10H18z" class="art-detail" />
        <path d="M20-22v-17h10M20-39h10" class="art-detail" />
      </g>`,
    team: `
      <g class="landmark-ink">
        <path class="landmark-fill" d="M-46 26h33v-45l-17-15-16 15zM13 26h33v-45L29-34 13-19zM-13 26h26V-8L0-20-13-8z" />
        <path d="M-38-8h10v11h-10zM21-8h10v11H21zM-6 4h12v22H-6zM-47-34h13M34-34h13M-43-40v12M43-40v12" class="art-detail" />
      </g>`,
    external: `
      <g class="landmark-ink">
        <path class="landmark-fill" d="M-43 26h86L30-30H-30z" />
        <path d="M-27 26V-30h54v56M-14-12h28v15h-28zM-34-30h68M-22-30v-13M22-30v-13" class="art-detail" />
        <path d="M-40-44h80M-32-50h64" class="art-detail" />
      </g>`,
    study: `
      <g class="landmark-ink">
        <path class="landmark-fill" d="M-38 26h76V-37L0-57-38-37z" />
        <path d="M-29-20h58v39h-58zM-20-10h40M-20 0h40M-20 10h28M-12-37h24v12h-24z" class="art-detail" />
        <path d="M-7 26V10h14v16" class="art-detail" />
      </g>`,
    materials: `
      <g class="landmark-ink">
        <path class="landmark-fill" d="M-42 26h84V-29L0-55-42-29z" />
        <path d="M-28-13h56v34h-56zM-18-3h36M-18 8h36M-11-37h22v12h-22zM-7 21V8h14v13" class="art-detail" />
        <path d="M-36-29 0-52 36-29" class="art-detail" />
      </g>`,
    work: `
      <g class="landmark-ink">
        <path class="landmark-fill" d="M-42 26h84V-19L0-52-42-19z" />
        <circle cx="0" cy="-5" r="16" class="art-detail" />
        <path d="M0-37v13M0 11v13M-32-5h16M16-5h16M-23-28l10 10M13-18l10-10M-23 18l10-10M13 8l10 10" class="art-detail" />
        <path d="M-13 26v-13h26v13" class="art-detail" />
      </g>`,
  };

  return art[landmark] ?? art.profile;
}

function illustrationArt() {
  return `
    <g class="treasure-map-illustration" aria-hidden="true">
      <g class="treasure-map-cartography">
        <path d="M72 168C186 135 300 152 412 118s207-25 316 10 219 17 392-12" />
        <path d="M74 348c118-38 224-28 332 3s233 21 337-11 260-24 390 10" />
        <path d="M83 548c116-25 231-12 344 18s214 27 326-7 241-42 369-4" />
        <path d="M204 52c-14 107-17 207-4 305s13 202-4 351" />
        <path d="M433 48c-11 111-6 205 6 311s7 201-5 352" />
        <path d="M696 48c12 103 11 204-4 307s-13 214 3 352" />
        <path d="M962 49c-14 100-13 201 2 300s16 205 2 357" />
        <path d="M117 112 1048 661M1090 120 154 654" class="cartography-faint" />
      </g>

      <g class="treasure-map-islands">
        <path class="treasure-map-island treasure-map-island--northwest" d="M87 124c34-25 72-17 104-34 35-19 68 1 91 25 20 22 57 17 71 47 14 29-10 55-40 58-29 3-47-10-72 7-30 20-61 4-90 17-31 14-70-1-82-28-12-28-9-72 18-92Z" />
        <path class="treasure-map-island treasure-map-island--northwest" d="M151 288c28-18 68-10 91 10 20 18 45 15 58 38 15 28-10 54-39 53-32-2-46-20-73-8-31 14-62-7-66-35-4-23 8-47 29-58Z" />
        <path class="treasure-map-island treasure-map-island--northeast" d="M684 103c31-24 68-10 96-22 32-14 58 4 75 31 17 25 52 26 63 56 12 33-14 59-45 57-31-2-50-21-76-8-35 18-59-5-88 2-34 9-63-18-61-49 2-25 12-52 36-67Z" />
        <path class="treasure-map-island treasure-map-island--northeast" d="M843 244c29-19 70-13 91 12 19 23 52 19 61 49 9 29-15 53-45 51-29-2-47-18-72-6-33 15-63-9-65-38-2-27 7-53 30-68Z" />
        <path class="treasure-map-island treasure-map-island--southwest" d="M90 420c27-27 67-20 91-41 27-23 58-2 80 18 23 20 51 12 72 40 19 26 4 57-25 68-28 11-46-3-72 11-31 17-63 2-87 16-30 17-68-5-75-36-7-27-4-54 16-76Z" />
        <path class="treasure-map-island treasure-map-island--southwest" d="M315 520c24-23 57-16 78-35 25-22 54-6 68 17 16 26 46 25 50 53 4 31-23 49-51 41-27-8-43-23-67-10-30 16-58-7-64-32-6-21-29-14-14-34Z" />
        <path class="treasure-map-island treasure-map-island--southeast" d="M708 431c29-25 67-14 91-31 28-20 58 3 79 21 20 17 52 13 71 39 21 28 6 63-25 70-31 8-48-11-76 4-34 18-64 2-91 16-30 15-67-7-73-39-5-28 3-61 24-80Z" />
        <path class="treasure-map-island treasure-map-island--southeast" d="M944 528c20-19 49-12 65-27 20-18 44-4 55 15 14 23 39 22 43 46 5 26-18 42-42 35-23-7-35-20-56-10-25 12-47-8-52-29-4-17-25-15-13-30Z" />
      </g>

      <g class="treasure-map-island-details">
        <path d="M120 160c26-16 51 4 76-13m-54 37c27-16 50 6 76-7m-11 44c24-14 45 1 65-9M727 132c25-15 47 2 71-11m-50 38c28-15 52 1 78-10m-9 40c22-12 43 2 62-8M122 469c31-16 52 5 77-9m-37 39c29-15 50 2 76-8m675-25c28-15 49 5 73-8m-30 40c24-11 43 5 66-7" />
        <path d="M132 209c33 10 53 1 71-16m568 40c35 12 53 4 77-12M124 540c31 12 52 1 69-14m604 8c26 14 48 7 70-10" class="island-detail-faint" />
      </g>

      <g class="treasure-map-decorations">
        <g class="hot-air-balloon" transform="translate(288 103)">
          <path class="illustration-fill" d="M0-49c-31-4-47 24-37 54 6 18 19 31 37 48 18-17 31-30 37-48 10-30-6-58-37-54Z" />
          <path d="M-30-19c20 14 40 14 60 0M-35 0c23 14 47 14 70 0M0-48v101M-17-42c10 13 24 13 34 0M-11 53 0 63l11-10M-10 63h20M-8 68h16" class="art-detail" />
        </g>
        <g class="hot-air-balloon" transform="translate(1081 350) scale(.82)">
          <path class="illustration-fill" d="M0-49c-31-4-47 24-37 54 6 18 19 31 37 48 18-17 31-30 37-48 10-30-6-58-37-54Z" />
          <path d="M-30-19c20 14 40 14 60 0M-35 0c23 14 47 14 70 0M0-48v101M-17-42c10 13 24 13 34 0M-11 53 0 63l11-10M-10 63h20M-8 68h16" class="art-detail" />
        </g>
        <g class="hot-air-balloon" transform="translate(151 624) scale(.73)">
          <path class="illustration-fill" d="M0-49c-31-4-47 24-37 54 6 18 19 31 37 48 18-17 31-30 37-48 10-30-6-58-37-54Z" />
          <path d="M-30-19c20 14 40 14 60 0M-35 0c23 14 47 14 70 0M0-48v101M-17-42c10 13 24 13 34 0M-11 53 0 63l11-10M-10 63h20M-8 68h16" class="art-detail" />
        </g>

        <g class="mountain-range" transform="translate(336 245)">
          <path d="m-86 35 60-83 33 48 43-72 73 107z" />
          <path d="m-44 4 18-48 17 23 16-7 26-41 22 42 22-9 31 51" class="art-detail" />
          <path d="M-85 35h208" class="art-detail" />
        </g>
        <g class="mountain-range" transform="translate(778 379) scale(.8)">
          <path d="m-86 35 60-83 33 48 43-72 73 107z" />
          <path d="m-44 4 18-48 17 23 16-7 26-41 22 42 22-9 31 51" class="art-detail" />
        </g>
        <g class="mountain-range" transform="translate(431 567) scale(.65)">
          <path d="m-86 35 60-83 33 48 43-72 73 107z" />
          <path d="m-44 4 18-48 17 23 16-7 26-41 22 42 22-9 31 51" class="art-detail" />
        </g>

        <g class="palm-grove" transform="translate(780 164)">
          <path d="M0 75V-2M0 5c-30-18-49-13-62 1 27 2 42 12 62 24M0 10c28-28 49-25 64-10-27 8-43 21-64 34M0 3c-10-34 0-51 18-61 4 28-4 43-18 61" />
          <path d="M39 86V29M39 36c-20-12-34-9-43 2 18 1 29 8 43 16M39 40c20-19 35-17 45-7-19 6-29 14-45 23" class="art-detail" />
        </g>
        <g class="palm-grove" transform="translate(1001 247) scale(.68)">
          <path d="M0 75V-2M0 5c-30-18-49-13-62 1 27 2 42 12 62 24M0 10c28-28 49-25 64-10-27 8-43 21-64 34M0 3c-10-34 0-51 18-61 4 28-4 43-18 61" />
        </g>

        <g class="lighthouse" transform="translate(1034 133)">
          <path class="illustration-fill" d="M-20 45h40L13-22H-13z" />
          <path d="M-13-22h26v-21h-26zM-22-43h44M-10-51h20M-7-34h14M-11-9h22M-14 13h28" class="art-detail" />
          <path d="M-32-51 32-51M-42-57h84" class="art-detail" />
        </g>

        <g class="castle" transform="translate(285 383)">
          <path class="illustration-fill" d="M-60 38h120V-4H-60zM-53-4v-53h21v22h19v-33h26v33h19v-22h21v53" />
          <path d="M-11 38V12h22v26M-43 11h12M31 11h12M-32-35h10M22-35h10M-1-22h2" class="art-detail" />
        </g>

        <g class="cabin" transform="translate(584 177)">
          <path class="illustration-fill" d="M-38 31h76V-2L0-35-38-2z" />
          <path d="M-27-4 0-27 27-4M-13 31V8h26v23M-30 2h11v11h-11zM19 2h11v11H19zM-10-35h20v12h-20z" class="art-detail" />
        </g>

        <g class="ship" transform="translate(619 659)">
          <path class="illustration-fill" d="M-90 10h180l-28 29H-62z" />
          <path d="M-4 10v-103M-4-91l-57 49h57M7-78l58 42H7M-35-11h56M-55 10h108" class="art-detail" />
          <path d="M-72 39h144" class="art-detail" />
        </g>

        <g class="signpost" transform="translate(130 290)">
          <path d="M0 47V-2M-33-4h65l-11-16h-43zM-25 17h49" />
        </g>
        <g class="signpost" transform="translate(518 221)">
          <path d="M0 47V-2M-33-4h65l-11-16h-43zM-25 17h49" />
        </g>
        <g class="signpost" transform="translate(1032 430) scale(.84)">
          <path d="M0 47V-2M-33-4h65l-11-16h-43zM-25 17h49" />
        </g>

        <g class="treasure-gem" transform="translate(175 156)">
          <path class="illustration-fill illustration-fill--red" d="m0-15 13 9 5 15-18 11-18-11 5-15z" />
          <path d="m-13-6 13 11 13-11M0 5v15" class="art-detail" />
        </g>
        <g class="treasure-gem" transform="translate(816 207)">
          <path class="illustration-fill illustration-fill--red" d="m0-15 13 9 5 15-18 11-18-11 5-15z" />
          <path d="m-13-6 13 11 13-11M0 5v15" class="art-detail" />
        </g>
        <g class="treasure-gem" transform="translate(785 555)">
          <path class="illustration-fill illustration-fill--red" d="m0-15 13 9 5 15-18 11-18-11 5-15z" />
          <path d="m-13-6 13 11 13-11M0 5v15" class="art-detail" />
        </g>

        <g class="map-cloud" transform="translate(520 90)">
          <path d="M0 26c13-23 40-27 59-11 18-29 60-17 63 16 28-9 53 9 53 35H-25c0-22 7-34 25-40Z" />
        </g>
        <g class="map-cloud" transform="translate(182 675) scale(.72)">
          <path d="M0 26c13-23 40-27 59-11 18-29 60-17 63 16 28-9 53 9 53 35H-25c0-22 7-34 25-40Z" />
        </g>

        <g class="treasure-map-compass" transform="translate(1044 614)" aria-label="나침반" role="img">
          <circle r="64" />
          <circle r="53" class="compass-inner" />
          <path d="m0-46 12 46-12 46-12-46z" class="compass-needle" />
          <path d="m-46 0 46-12 46 12-46 12z" class="compass-needle compass-needle--secondary" />
          <path d="m0-58 7 7-7 7-7-7z" class="compass-star" />
          <text x="0" y="-73">N</text><text x="0" y="91">S</text>
          <text x="77" y="5">E</text><text x="-77" y="5">W</text>
        </g>
      </g>
    </g>
  `;
}

function routeArt() {
  return `
    <g class="treasure-map-routes" aria-hidden="true">
      <path class="treasure-map-route" d="M122 238C205 198 295 219 344 276S423 365 475 320 535 220 612 240 708 331 774 301 852 229 953 258 1031 335 962 397 837 390 780 452 840 507 928 488 1008 462" />
      <path class="treasure-map-route treasure-map-route--lower" d="M212 395C285 373 352 396 398 449S488 530 553 509 631 435 697 458 747 544 713 592" />
      <path class="treasure-map-route treasure-map-route--short" d="M522 226C560 192 600 178 646 184" />
      <g class="treasure-map-route-label" transform="translate(610 390)">
        <path d="M-51 0c16-18 31-19 51-19s35 1 51 19c-16 18-31 19-51 19S-35 18-51 0Z" />
        <text x="0" y="5">보물의 길</text>
      </g>
      <circle cx="600" cy="365" r="10" class="route-stop" />
      <circle cx="288" cy="220" r="6" class="route-stop" />
      <circle cx="912" cy="205" r="6" class="route-stop" />
      <circle cx="264" cy="509" r="6" class="route-stop" />
      <circle cx="936" cy="486" r="6" class="route-stop" />
      <circle cx="480" cy="150" r="6" class="route-stop" />
      <circle cx="732" cy="150" r="6" class="route-stop" />
    </g>
  `;
}

function createSvg() {
  return `
    <svg class="treasure-map-svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" role="img" aria-label="프로젝트 보물지도 일러스트">
      <defs>
        <filter id="treasure-map-paper-noise" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="2" seed="14" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
          <feComponentTransfer in="mono" result="softNoise"><feFuncA type="table" tableValues="0 0.07" /></feComponentTransfer>
          <feBlend in="SourceGraphic" in2="softNoise" mode="multiply" />
        </filter>
        <pattern id="treasure-map-grid" width="76" height="76" patternUnits="userSpaceOnUse">
          <path d="M76 0H0V76" fill="none" stroke="#76523a" stroke-opacity=".09" stroke-width="1" />
        </pattern>
      </defs>
      <rect class="treasure-map-paper" x="12" y="12" width="1176" height="736" rx="4" filter="url(#treasure-map-paper-noise)" />
      <rect class="treasure-map-grid" x="34" y="34" width="1132" height="692" />
      <rect class="treasure-map-frame" x="34" y="34" width="1132" height="692" rx="2" />
      <path class="treasure-map-frame-inner" d="M52 68V52h18M1130 52h18v18M52 690v18h18M1130 708h18v-18" />
      ${illustrationArt()}
      ${routeArt()}
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
            <svg viewBox="-58 -76 116 112" focusable="false">${landmarkArt(landmark)}</svg>
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
      <p class="treasure-map-hint">지도를 눌러 탐방하기</p>
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
    focusLandmark(islandId) {
      [...container.querySelectorAll('[data-island-id]')]
        .find((button) => button.dataset.islandId === islandId)
        ?.focus();
    },
    destroy() {
      container.removeEventListener('click', handleClick);
      container.innerHTML = '';
    },
  };

  api.setReducedMotion(reducedMotion);
  return api;
}
