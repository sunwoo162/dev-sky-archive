# Voxel Sky World Design

## Intent

Replace the decorative 2.5D sky cards with a real, modular 3D game space. The portfolio categories remain floating islands, but every island is built from reusable block tiles and small props so the result reads like a playable game rather than a generated illustration.

## Goals

- Render the sky hub with a fixed forward-looking `PerspectiveCamera` placed outside the islands and WebGL.
- Build island terrain from repeated grass, soil, and stone block modules.
- Build each category island from the same tile grammar with a distinct building prop.
- Keep island selection clickable in 3D and keyboard-accessible through existing buttons.
- Preserve the existing sky → 2D island → project exhibit flow.
- Keep the project buildless and GitHub Pages compatible.

## Non-goals

- Full free-camera orbit controls.
- A physics engine or editable map maker.
- AI-generated imagery in the shipped 3D world.
- Replacing the 2D project world or exhibit content in this pass.

## Visual rules

- Perspective view from a fixed viewer position, with a stable center target and no free orbit.
- Island placement uses depth layers: foreground islands are larger and background islands recede toward the horizon.
- One world tile is one grid unit; all terrain and props snap to that grid.
- Flat-shaded materials, limited palette, no noisy texture detail.
- Three terrain layers: grass top, soil band, dark stone underside.
- Buildings are low-poly block assemblies with one readable silhouette per island.
- Ambient cloud blocks and small lights provide depth without turning the scene into concept art.

## Technical shape

- `src/sky-3d.js` owns the Three.js scene, tile factories, island composition, pointer picking, resize handling, and render loop.
- `src/app.js` owns navigation state and calls the scene controller when the sky screen is shown.
- `index.html` loads Three.js through an import map from the official buildless CDN entry and provides a canvas host.
- Existing DOM island buttons stay in the accessibility layer; the WebGL scene is the visual layer.
