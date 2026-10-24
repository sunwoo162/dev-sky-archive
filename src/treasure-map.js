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
  const isShip = landmark === 'team' || landmark === 'materials';
  const landmarkKind = { team: 'ship', materials: 'ship' }[landmark] ?? 'island';

  if (isShip) {
    return `
      <g class="landmark-ink landmark-ship landmark-${landmarkKind}--${landmark}" aria-hidden="true">
        <ellipse class="landmark-water" cx="0" cy="29" rx="62" ry="10" />
        <path class="landmark-hull" d="M-58 4h116l-13 23c-23 12-67 12-90 0Z" />
        <path class="landmark-hatch" d="M-43 14l10 8m3-8 10 8m3-8 10 8m3-8 10 8m3-8 10 8m3-8 10 8" />
        <path class="landmark-mast" d="M0 5V-53M-43 7H45" />
        <path class="landmark-flagpole" d="M0 5V-53" />
        <path class="landmark-sail" d="M-2-48-37 1H-2Z" />
        <path class="landmark-sail landmark-sail--secondary" d="M4-39 34-2H4Z" />
        <path class="landmark-line" d="M-43 7-28 25m71-18L28 25M-28 12h56M-20 21h40" />
        <path class="landmark-accent" d="M-10-53h20l-10-9Z" />
        <path class="landmark-flag" d="M2-52h26L2-41Z" />
        ${landmark === 'materials' ? '<path class="landmark-cargo" d="M-32 2h14v10h-14zm19 0h14v10h-14z" />' : '<path class="landmark-accent" d="M-28-53h15l-15 8Z" />'}
      </g>`;
  }

  const islandDetail = {
    profile: '<path class="landmark-building" d="M-17 10v-25h34v25z" /><path class="landmark-roof" d="m-22-15 22-18 22 18z" /><path class="landmark-window" d="M-7-6h14v10H-7z" /><path class="landmark-accent" d="M-2-33h4v-9h-4z" />',
    personal: '<path class="landmark-building" d="M-17 11v-21h34v21z" /><path class="landmark-roof" d="m-22-30 22-19 22 19z" /><path class="landmark-window" d="M-6-2h12v13H-6z" />',
    external: '<path class="landmark-building" d="M-12 11-8-30H8l4 41z" /><path class="landmark-roof" d="M-13-30h26l-5-7H-8z" /><path class="landmark-window" d="M-4-22h8v7H-4zm-1 13h10v7H-5z" /><path class="landmark-accent" d="M8-37v-18M8-55h21l-21 9z" />',
    study: '<path class="landmark-building" d="M-23 10V-10l23-13 23 13v20z" /><path class="landmark-roof" d="M-28-10 0-28l28 18-7 5L0-15l-21 10z" /><path class="landmark-window" d="M-7-4h14v14H-7z" /><path class="landmark-accent" d="M-13-7h26M-13-1h26" />',
    work: '<path class="landmark-building" d="M-20 11v-27h40v27z" /><path class="landmark-roof" d="m-25-16 25-20 25 20z" /><path class="landmark-window" d="M-11-8h8v8h-8zm14 0h8v8H3z" /><path class="landmark-accent" d="M0-36v-10m-8 5h16M-6-48 6-36M6-48-6-36" />',
  }[landmark] ?? '<path class="landmark-building" d="M-16 11v-22h32v22z" /><path class="landmark-roof" d="m-21-11 21-18 21 18z" />';

  return `
    <g class="landmark-ink landmark-island landmark-${landmarkKind}--${landmark}" aria-hidden="true">
      <ellipse class="landmark-water" cx="0" cy="42" rx="64" ry="8" />
      <path class="landmark-base" d="M-55 1c12-13 31-18 51-14 18-6 39-1 57 13l-7 18-12 7-8 14-15-7-12 14-15-12-17 8-8-14-14-5Z" />
      <path class="landmark-hatch" d="M-42 25l11 8m2-12 11 8m3-12 11 8m3-12 11 8m3-12 11 8m3-12 11 8" />
      <path class="landmark-top" d="M-60 0c16-18 37-22 58-16 21-7 45-1 62 16-17 15-37 19-59 13-21 7-43 3-61-13Z" />
      <path class="landmark-shore" d="M-43 7c13 6 27 8 42 3 17 5 31 3 44-4M-37 18c11 3 21 3 31 0m12 0c10 3 20 2 30-1" />
      <path class="landmark-tree" d="M-39 9v-26M-39-13c-12-11-22-9-30-4 11 2 21 8 30 15M-39-8c11-13 21-13 30-7-11 4-21 10-30 18M-27 12V-2M-27 1c-7-7-13-6-18-3 7 2 12 5 18 9M-27 3c7-8 13-8 18-4-7 2-12 6-18 11" />
      <path class="landmark-flagpole" d="M36 5V-48" />
      <path class="landmark-flag" d="M38-47h25L38-36Z" />
      <path class="landmark-flag-base" d="M30 6h12" />
      ${islandDetail}
    </g>`;
}

function illustrationArt() {
  return `
    <g class="treasure-map-illustration" aria-hidden="true">
      <g class="treasure-map-cartography">
        <path d="M68 142H1134M68 270H1134M68 398H1134M68 526H1134M68 654H1134" />
        <path d="M188 30V728M374 30V728M560 30V728M746 30V728M932 30V728" />
        <path d="M76 78 1124 682M1124 78 76 682" class="cartography-faint" />
      </g>

      <path class="treasure-map-mainland" d="M181 125c35-35 77-28 112-24 39 4 60-20 98-9 35 10 54 34 88 20 38-16 61 7 95 8 38 1 61-25 96-10 36 15 59 4 94 13 39 10 56 42 89 48 36 6 51 30 45 60-7 35 26 47 15 80-11 34-48 42-47 75 2 35-29 48-58 53-34 6-46 40-78 47-37 8-60 32-91 29-35-4-58 20-91 12-34-8-57 12-90 4-37-9-59 16-92 2-36-15-55-2-85-24-28-20-62-15-76-45-14-29-41-39-34-70 7-30-22-52-8-80 16-31-9-60 18-89Z" />

      <g class="treasure-map-ink-density" aria-hidden="true">
        <g class="terrain-hatching">
          <path d="M230 181l-34 37m52-45-44 57m63-64-49 71m72-73-53 78m72-66-44 65m68-54-34 49" />
          <path d="M368 194l-25 42m43-55-32 58m51-60-35 65m58-60-30 55m58-43-26 45" />
          <path d="M321 455l-34 47m52-56-42 64m62-72-49 76m69-72-45 68m67-61-37 55" />
          <path d="M718 339l-32 41m49-52-40 61m58-69-45 70m62-67-38 58m58-47-28 43" />
          <path d="M792 494l-31 42m48-51-40 61m60-65-41 69m58-57-31 52" />
        </g>

        <g class="terrain-river">
          <path d="M640 112c-10 35-6 59-25 83-22 27-17 49 7 69 26 22 17 47-7 67-25 21-17 42 5 61 22 19 18 38-3 58-27 26-21 54-2 83 15 22 11 40-3 62" />
          <path d="M639 331c-35 15-49 28-65 50-16 21-34 24-58 16m84 6c-18 25-15 43 7 62 17 16 17 35 5 55" class="river-branch" />
        </g>

        <g class="terrain-forest" transform="translate(247 286)">
          <path d="M0 20 7 4l6 16M20 24l7-18 7 18M40 22l8-20 8 20M61 26l7-17 7 17M84 20l7-19 7 19M106 26l7-18 7 18" />
          <path d="M10 31v-8m20 8v-8m20 8v-8m21 8v-8m22 8v-8m22 8v-8" class="forest-trunk" />
        </g>
        <g class="terrain-forest" transform="translate(680 244) scale(.86)">
          <path d="M0 20 7 4l6 16M20 24l7-18 7 18M40 22l8-20 8 20M61 26l7-17 7 17M84 20l7-19 7 19M106 26l7-18 7 18" />
          <path d="M10 31v-8m20 8v-8m20 8v-8m21 8v-8m22 8v-8m22 8v-8" class="forest-trunk" />
        </g>
        <g class="terrain-forest" transform="translate(560 483) scale(.8)">
          <path d="M0 20 7 4l6 16M20 24l7-18 7 18M40 22l8-20 8 20M61 26l7-17 7 17M84 20l7-19 7 19M106 26l7-18 7 18" />
          <path d="M10 31v-8m20 8v-8m20 8v-8m21 8v-8m22 8v-8m22 8v-8" class="forest-trunk" />
        </g>

        <g class="terrain-village" transform="translate(518 318)">
          <path d="M0 24h32V4L16-10 0 4zM42 24h36V-1L60-14 42-1zM88 24h27V7L101-3 88 7z" />
          <path d="M11 24V12h10v12M54 24V10h12v14M97 24V13h8v11" class="village-door" />
          <path d="M-9 30h132" class="village-ground" />
        </g>
        <g class="terrain-village" transform="translate(762 427) scale(.76)">
          <path d="M0 24h32V4L16-10 0 4zM42 24h36V-1L60-14 42-1zM88 24h27V7L101-3 88 7z" />
          <path d="M11 24V12h10v12M54 24V10h12v14M97 24V13h8v11" class="village-door" />
          <path d="M-9 30h123" class="village-ground" />
        </g>

        <g class="terrain-port" transform="translate(310 540)">
          <path d="M0 20h106M15 20V2m19 18V-7m19 27V0m19 20V-9m19 29V4" />
          <path d="M9-1h17m18-6h17m18 9h17m-91 18 14-14m10 14 15-18m12 18 15-15m11 15 14-18" class="port-detail" />
          <path d="M-16 32h140" class="village-ground" />
        </g>

        <g class="terrain-coast-hatch">
          <path d="M166 245l-25 15m33-1-23 14m26-1-22 14m-42 84-24 16m33-1-23 15m36-1-22 14M935 370l-25 15m33-1-23 15m38-1-25 16M932 505l-24 15m32-1-22 14" />
        </g>
      </g>

      <g class="treasure-map-islands">
        <path class="treasure-map-island treasure-map-island--northwest" d="M108 92c31-22 63-10 88-28 30-21 62-6 70 25 8 25 31 32 25 58-7 28-38 32-60 20-26-14-43 2-69 1-30-1-58-21-60-47-2-12-1-22 6-29Z" />
        <path class="treasure-map-island treasure-map-island--north" d="M462 72c28-19 57-10 79-25 25-18 52-7 63 18 9 22 31 27 27 48-6 25-34 28-57 18-23-10-41 4-64 1-27-4-52-19-53-39-1-8 0-15 5-21Z" />
        <path class="treasure-map-island treasure-map-island--northeast" d="M866 89c26-19 53-9 75-24 27-19 55-5 64 23 8 25 29 33 22 57-8 26-38 29-59 17-24-14-40 2-65 0-27-2-50-20-50-42 0-12 2-22 13-31Z" />
        <path class="treasure-map-island treasure-map-island--west" d="M77 364c23-18 48-10 67-25 22-18 48-7 56 18 7 21 26 28 21 49-6 24-32 27-52 17-21-11-36 3-57 0-24-3-43-18-44-37-1-8 1-15 9-22Z" />
        <path class="treasure-map-island treasure-map-island--south" d="M424 566c25-18 55-9 76-25 27-19 56-5 65 24 7 23 29 31 20 56-9 25-38 29-60 16-25-14-42 2-67-1-28-3-52-20-52-42 0-11 3-20 18-28Z" />
        <path class="treasure-map-island treasure-map-island--southeast" d="M758 527c23-18 51-9 70-23 25-19 52-5 61 23 7 22 28 29 21 51-8 25-35 29-58 17-21-11-38 3-59 0-25-3-46-18-46-39 0-11 3-20 11-29Z" />
      </g>

      <g class="treasure-map-island-details">
        <path d="M118 113c24-15 44 2 66-12m-54 31c23-14 43 3 65-8m-31 30c19-10 35 1 53-7M487 94c23-14 43 1 62-10m-47 31c22-13 42 1 60-8m-39 29c17-10 34 0 49-7M896 113c22-14 42 1 59-10m-46 31c21-12 39 1 57-8m-34 29c18-10 32 0 48-7M99 386c19-13 35 0 51-9m-38 28c20-12 36 1 52-7M452 593c21-14 42 1 60-9m-44 31c21-13 42 1 59-8m277-29c20-13 39 0 55-9m-39 29c21-12 39 1 55-8" />
        <path d="M123 151c22 11 42 3 57-12m344 6c22 10 39 4 57-10m381 13c25 9 40 2 58-13M104 417c19 10 35 4 49-9m307 230c20 10 37 3 53-11m300-25c21 9 38 2 54-11" class="island-detail-faint" />
      </g>

      <g class="treasure-map-decorations">
        <g class="hot-air-balloon" transform="translate(231 99)">
          <path class="illustration-fill" d="M0-53c-31-2-45 23-40 51 4 25 18 41 40 59 22-18 36-34 40-59 5-28-9-53-40-51Z" />
          <path d="M-34-22c22 15 46 15 68 0M-38 0c25 15 51 15 76 0M0-52v75M-20-46c10 15 30 15 40 0M-13 23-7 35M13 23 7 35M-9 35h18M-7 40h14" class="art-detail" />
        </g>
        <g class="hot-air-balloon" transform="translate(1080 309) scale(.82)">
          <path class="illustration-fill" d="M0-53c-31-2-45 23-40 51 4 25 18 41 40 59 22-18 36-34 40-59 5-28-9-53-40-51Z" />
          <path d="M-34-22c22 15 46 15 68 0M-38 0c25 15 51 15 76 0M0-52v75M-20-46c10 15 30 15 40 0M-13 23-7 35M13 23 7 35M-9 35h18M-7 40h14" class="art-detail" />
        </g>
        <g class="hot-air-balloon" transform="translate(116 653) scale(.72)">
          <path class="illustration-fill" d="M0-53c-31-2-45 23-40 51 4 25 18 41 40 59 22-18 36-34 40-59 5-28-9-53-40-51Z" />
          <path d="M-34-22c22 15 46 15 68 0M-38 0c25 15 51 15 76 0M0-52v75M-20-46c10 15 30 15 40 0M-13 23-7 35M13 23 7 35M-9 35h18M-7 40h14" class="art-detail" />
        </g>

        <g class="mountain-range" transform="translate(356 174)">
          <path d="m-92 38 44-67 26 37 35-61 71 91z" />
          <path d="m-62 14 14-43 14 25 12-7 22-37 18 37 17-8 27 37M-83 38h128" class="art-detail" />
        </g>
        <g class="mountain-range" transform="translate(420 486) scale(.88)">
          <path d="m-92 38 44-67 26 37 35-61 71 91z" />
          <path d="m-62 14 14-43 14 25 12-7 22-37 18 37 17-8 27 37M-83 38h128" class="art-detail" />
        </g>
        <g class="mountain-range" transform="translate(800 355) scale(.76)">
          <path d="m-92 38 44-67 26 37 35-61 71 91z" />
          <path d="m-62 14 14-43 14 25 12-7 22-37 18 37 17-8 27 37M-83 38h128" class="art-detail" />
        </g>

        <g class="cabin" transform="translate(571 143)">
          <path class="illustration-fill" d="M-38 31h76V0L0-35-38 0z" />
          <path d="M-27-2 0-27 27-2M-13 31V9h26v22M-29 4h11v11h-11zM18 4h11v11H18z" class="art-detail" />
        </g>
        <g class="castle" transform="translate(775 157)">
          <path class="illustration-fill" d="M-59 37h118V-4H-59zM-51-4v-49h20v21h18v-31h25v31h18v-21h20v49" />
          <path d="M-10 37V12h20v25M-42 10h12M30 10h12M-31-32h10M21-32h10M-1-20h2" class="art-detail" />
        </g>
        <g class="castle" transform="translate(277 394) scale(.88)">
          <path class="illustration-fill" d="M-59 37h118V-4H-59zM-51-4v-49h20v21h18v-31h25v31h18v-21h20v49" />
          <path d="M-10 37V12h20v25M-42 10h12M30 10h12M-31-32h10M21-32h10M-1-20h2" class="art-detail" />
        </g>

        <g class="lighthouse" transform="translate(1032 116)">
          <path class="illustration-fill" d="M-20 47h40L13-20H-13z" />
          <path d="M-13-20h26v-22h-26zM-22-42h44M-10-50h20M-7-33h14M-11-6h22M-14 17h28M-34-50h68M-42-56h84" class="art-detail" />
        </g>

        <g class="palm-grove" transform="translate(702 155)">
          <path d="M0 73V-5M0 1c-31-20-52-14-64 1 28 3 45 13 64 25M0 8c28-29 51-25 67-9-29 8-46 22-67 35M0-1c-11-34 0-53 20-63 4 29-4 45-20 63" />
        </g>
        <g class="palm-grove" transform="translate(914 224) scale(.74)">
          <path d="M0 73V-5M0 1c-31-20-52-14-64 1 28 3 45 13 64 25M0 8c28-29 51-25 67-9-29 8-46 22-67 35M0-1c-11-34 0-53 20-63 4 29-4 45-20 63" />
        </g>

        <g class="ship" transform="translate(588 655)">
          <path class="illustration-fill" d="M-96 7h192l-29 32H-67z" />
          <path d="M-5 7v-111M-5-93l-58 50h58M7-80l61 43H7M-37-11h58M-60 7h116M-77 39h154" class="art-detail" />
        </g>

        <g class="treasure-map-compass treasure-map-compass--large" transform="translate(1010 134) scale(.82)" aria-label="나침반" role="img">
          <circle r="71" />
          <circle r="59" class="compass-inner" />
          <path d="m0-53 14 53-14 53-14-53z" class="compass-needle" />
          <path d="m-53 0 53-14 53 14-53 14z" class="compass-needle compass-needle--secondary" />
          <path d="m0-65 8 8-8 8-8-8z" class="compass-star" />
          <text x="0" y="-83">N</text><text x="0" y="101">S</text>
          <text x="92" y="6">E</text><text x="-92" y="6">W</text>
        </g>
        <g class="treasure-map-compass treasure-map-compass--small" transform="translate(126 600) scale(.55)" aria-label="나침반 장식" role="img">
          <circle r="71" />
          <circle r="59" class="compass-inner" />
          <path d="m0-53 14 53-14 53-14-53z" class="compass-needle" />
          <path d="m-53 0 53-14 53 14-53 14z" class="compass-needle compass-needle--secondary" />
          <path d="m0-65 8 8-8 8-8-8z" class="compass-star" />
        </g>

        <g class="signpost" transform="translate(128 206)">
          <path d="M0 45V-8M-34-10h68l-11-16h-46zM-26 14h52" />
        </g>
        <g class="signpost" transform="translate(473 227)">
          <path d="M0 45V-8M-34-10h68l-11-16h-46zM-26 14h52" />
        </g>
        <g class="signpost" transform="translate(1064 190)">
          <path d="M0 45V-8M-34-10h68l-11-16h-46zM-26 14h52" />
        </g>
        <g class="signpost" transform="translate(136 454)">
          <path d="M0 45V-8M-34-10h68l-11-16h-46zM-26 14h52" />
        </g>

        <g class="treasure-gem" transform="translate(129 117)">
          <path class="illustration-fill illustration-fill--red" d="m0-15 13 9 5 15-18 11-18-11 5-15z" />
          <path d="m-13-6 13 11 13-11M0 5v15" class="art-detail" />
        </g>
        <g class="treasure-gem" transform="translate(804 202)">
          <path class="illustration-fill illustration-fill--red" d="m0-15 13 9 5 15-18 11-18-11 5-15z" />
          <path d="m-13-6 13 11 13-11M0 5v15" class="art-detail" />
        </g>
        <g class="treasure-gem" transform="translate(518 438)">
          <path class="illustration-fill illustration-fill--red" d="m0-15 13 9 5 15-18 11-18-11 5-15z" />
          <path d="m-13-6 13 11 13-11M0 5v15" class="art-detail" />
        </g>

        <g class="map-cloud" transform="translate(316 80)">
          <path d="M0 24c14-21 38-25 57-10 17-25 51-16 55 12 25-8 46 7 46 30H-21c0-18 7-27 21-32Z" />
        </g>
        <g class="map-cloud" transform="translate(639 675) scale(.78)">
          <path d="M0 24c14-21 38-25 57-10 17-25 51-16 55 12 25-8 46 7 46 30H-21c0-18 7-27 21-32Z" />
        </g>
      </g>
    </g>
  `;
}

function routeArt() {
  return `
    <g class="treasure-map-routes treasure-map-route-label" aria-hidden="true">
      <path class="treasure-map-route" d="M120 191c85-34 173-25 237 20s94 87 154 43 64-111 137-107 112 68 175 63 84-55 149-36" />
      <path class="treasure-map-route" d="M184 265c56 27 117 19 157-14s93-20 126 17 68 55 112 33 84-79 133-47 61 83 127 82 110-48 159-28" />
      <path class="treasure-map-route treasure-map-route--lower" d="M240 427c73-39 140-15 191 31s101 49 149 6 98-78 152-51 72 87 129 78" />
      <path class="treasure-map-route treasure-map-route--short" d="M558 237c35-31 69-42 111-38" />
    </g>
  `;
}

function createSvg() {
  return `
    <svg class="treasure-map-svg" viewBox="0 0 1792 1024" preserveAspectRatio="xMidYMid slice" role="img" aria-label="프로젝트 보물지도 일러스트">
      <image class="treasure-map-raster" href="./assets/maps/treasure-map-etched.png" x="0" y="0" width="1792" height="1024" preserveAspectRatio="none" />
      <g class="treasure-map-interaction-ink" transform="scale(1.493333 1.347368)">
        ${routeArt()}
      </g>
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
          <span class="treasure-map-landmark__label">${title}</span>
              <span class="treasure-map-landmark__art" aria-hidden="true">
                <svg viewBox="-82 -70 164 122" focusable="false">${landmarkArt(landmark)}</svg>
              </span>
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
