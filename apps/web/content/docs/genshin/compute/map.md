---
title: Compute queue: Map
description: The map screen's runs: its names and glyphs over the terrain, and the Galesong Hill label.
---

# Map

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {map-names-interface} needs game-exports, parity-page — **Map: the names and the interface's glyphs scored over the terrain's mask.** `pnpm -C scripts genshin:parity compare map-overlay-jueyun`, its `mask` rectangles replaced by the glyphs' silhouettes traced off the reference's interface with `genshin:parity trace`, since a box holds terrain the page does not draw. Bar: the masked mean difference at 2%, each name's box read against its own. — blocked: each area's name is placed from a statue landmark, and the regions' data holds one landmark (Liyue Harbor's), so no name is drawn to trace or score; the glyphs' silhouettes follow once the names are drawn.
- [ ] `[page]` {map-galesong-hill} needs game-exports, media-engine, parity-page — **Map: Galesong Hill's count and percentage on its label, read against the English map's stepping.** The map overlay is shot on the parity page with the Mondstadt slice of `exploration` at the still's progress, through a fixture variant for it (the fixture is not yet written), `pnpm -C scripts genshin:parity compare map-overlay-galesong`, its reference the still of `captures/yt-kgW2IgWKukg-exploration-steps.mp4` at 4.6 seconds, the zoomed-out English map with Galesong Hill at 99% (100% at 11.6 seconds, after one chest), its controller prompts along the bottom outside the label. Writes the label's type size and its line's place as `MAP_PROGRESS_SHARE` and `MAP_PROGRESS_OFFSET_SHARE` (`packages/genshin-world/src/services/map/constants.ts`), each provisional comment replaced by how it was read ([exploration progress](/docs/genshin/exploration-progress)). Bar: the region's mean difference is the bar, 2%, and the label reads the still's percentage. — input missing: the parity fixture at the still's progress (not yet written)

## Reference

- `exploration-steps.mkv` — the English PC client's map (M) zoomed out until Galesong Hill's percentage shows, then the Statue of The Seven at Windrise resonated with, one chest in the area opened, one camp cleared, one puzzle solved, one Anemoculus offered at the statue, and one ingredient picked up from a plant in the area, the percentage read before and after each, 3 minutes at most, at 60 frames a second. Each kind's weight is the step in the percentage times the area's total, and the picked ingredient shows whether gathering counts ([exploration progress](/docs/proposals/genshin/exploration-progress)). Partly found 2026-10-11: https://www.youtube.com/watch?v=JeWZtXJ7cfM at 15–55 s (`captures/yt-JeWZtXJ7cfM-exploration-steps.mp4`); and https://www.youtube.com/watch?v=kgW2IgWKukg at 0–14 s (`captures/yt-kgW2IgWKukg-exploration-steps.mp4`), the English map at 1080p and 60 frames a second with controller prompts, Galesong Hill's label at 99% (about 4.6 s), one chest opened, and 100% on the same zoom (about 11.6 s); still sought: the percentage before and after each other action (camp, puzzle, Anemoculus, ingredient), since no public clip shows them; the 1080p, 30 fps guide clip has the chest but no percentage readout.
