# Category Travel Implementation Plan

## 1. Domain model and tests

- [x] Add a focused travel module with the category graph, BFS shortest-path function, duration calculation, and destination Tip selection.
- [x] Add unit tests for direct paths, multi-hop paths, unreachable/unknown nodes, duration monotonicity, same-node behavior, and one-line Tip selection.
- [x] Extend the app session without breaking the existing screen transition contract; track the last map location and travel payload.

## 2. Travel screen and transition

- [x] Add a dedicated travel screen to `index.html` with route, progress, and Tip elements.
- [x] Add the parchment/ink travel visual treatment to `src/styles.css`, including reduced-motion behavior and disabled destination interaction while traveling.
- [x] Change map selection in `src/app.js` to calculate a route and show travel before entering the island.
- [x] Preserve the visited island as the next map origin when returning to the sky map.

## 3. Integration and verification

- [x] Update cache-busting query versions for the changed browser modules.
- [x] Run all Node tests, syntax checks, and `git diff --check`.
- [x] Manually verify first entry, return-to-map, multi-hop travel, progress completion, and Tip rendering in the local browser.
- [ ] Verify reduced-motion in a browser setting before release.
- [ ] Commit only the intended source, test, and design-document changes; keep unrelated audit files untracked.
