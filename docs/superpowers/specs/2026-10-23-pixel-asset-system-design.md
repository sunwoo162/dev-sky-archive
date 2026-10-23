# Pixel Asset System Design

## Intent

Replace the current CSS-only geometric decoration with a small, original pixel asset system that makes the portfolio world feel authored and game-like. The sky screen is an isometric 3D-feeling world assembled from an extruded island bed, typed island surfaces, and island props. The visual reference is the way Zombie High Maker separates maps, tiles, objects, characters, and editor UI; no proprietary sprites or images are copied.

## Goals

- Give every visual layer a named, replaceable asset instead of an inline CSS shape.
- Make the 2D island read as a composed top-down world: terrain, path, building, prop, player, and project marker.
- Keep the frontend portfolio value visible through an asset catalog, data-driven composition, responsive UI, and accessible controls.
- Preserve the current interaction flow: sky map → island → project exhibit.
- Keep the build dependency-free and GitHub Pages compatible.

## Non-goals

- Rebuilding the project as a full map editor.
- Copying Zombie High Maker assets, sprites, logos, or UI artwork.
- Replacing the real project material placeholders before the user provides content.
- Introducing a game engine or a runtime asset pipeline.

## Asset boundaries

- `assets/world`: sky hub, extruded island beds, and typed island surfaces.
- `assets/tiles`: top-down terrain and path pieces.
- `assets/characters`: player and NPC sprites.
- `assets/props`: buildings, signs, terminals, and exhibit objects.
- `assets/ui`: cursors, badges, and editor-like frame elements.
- `assets/projects`: replaceable project preview art.
- `src/asset-catalog.js`: the single runtime catalog that maps asset IDs to URLs and semantic roles.

## Visual direction

Use a restrained 16-bit-inspired pixel language: hard edges, limited palettes, one-pixel highlights, readable silhouettes, and no gradients inside world sprites. The sky hub may keep a soft atmospheric background, but islands and the playable map should use the same pixel palette so the two screens belong to one world.

## Sky hub composition revision

The five hubs are not interchangeable decorative islands. Their silhouettes communicate the archive taxonomy before a user opens a project: the profile hub is a circular core, personal projects use a warm archive tower, team projects use paired collaboration towers, external activities use a gateway, and study uses a book tower. The camera is a low front-observation perspective rather than a flat overhead diagram; elevation values are intentionally separated so the world has clear foreground, middle-ground, and background tiers. World labels use Korean because they are navigation, not internal code names.

## Interaction and rendering

The sky map renders a 3D-feeling composition from an island bed, island surface, building props, trees, lamps, and a selection ring. The island canvas preloads and draws catalogued SVG assets for terrain, buildings, project pins, and the player. Project data continues to own positions and metadata; asset IDs are presentation fields, so content updates do not require renderer changes.

## Constraints

- Existing keyboard and click navigation must remain intact.
- Existing reduced-motion and focus behavior must remain intact.
- Every asset must be original, local, and inspectable in the repository.
- Tests must verify catalog coverage, local paths, and the rendered asset hooks.
