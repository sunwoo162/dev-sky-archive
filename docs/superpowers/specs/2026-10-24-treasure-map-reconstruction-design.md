# Treasure Map Reconstruction Design

## Intent

Replace the current landing-map composition with a dense, hand-drawn treasure-map illustration based on the supplied reference: parchment, dark brown ink, irregular land masses, route markings, mountains, balloons, palms, castle, lighthouse, ship, signposts, gems, and compass.

The map remains the portfolio game's first screen. The seven Korean category buttons stay interactive, but they become quiet overlay hit areas and parchment labels on top of the illustration instead of a row of generic building assets.

## Goals

- Make the first impression read as an illustrated treasure map before it reads as a UI.
- Preserve all seven accessible island entry points and their current click/focus behavior.
- Give each category a hand-drawn landmark treatment that belongs to the same ink system.
- Keep the implementation local, buildless, dependency-free, and responsive.

## Non-goals

- No return to the previous 3D/sky-island landing.
- No generated raster art, external image download, or third-party asset dependency.
- No change to the island worlds, project data, document reader, or AI-work hub behavior.

## Visual direction

- Base: warm parchment with a thin double border and restrained paper grain.
- Ink: one brown line-art system with limited muted red route/treasure accents.
- Composition: large organic continents and a winding dotted route create the map body; decorative landmarks fill negative space like an illustrated atlas.
- Interaction: HTML buttons overlay the map at known coordinates; labels look like small parchment sign plates and only become more prominent on hover/focus.

## Implementation calls

- Keep the existing inline SVG renderer and expand its illustration layers rather than adding an image pipeline.
- Replace the sparse geometric coast/decorative groups with named illustration groups and richer path detail.
- Keep the `map.x`, `map.y`, `map.landmark`, and `map.label` content contract unchanged so island navigation remains data-driven.

