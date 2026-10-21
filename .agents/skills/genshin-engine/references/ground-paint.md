# Ground paint

Read when a region's ground colour is painted from its layers.

The one-line rule is in `SKILL.md`; this page is its reasoning.

- **Ground is painted by its layers, placed where its terrain places them.** A region's ground colour is `createGroundPaintColor` over its `GroundPaint`, its layers' shares read from its fitted field (`layerField`) and its rules laid over them, weights solved per vertex in the terrain worker as the game holds its per texel, never a colour function written by hand (`openspec/specs/genshin/ground-paint/design.md`).
