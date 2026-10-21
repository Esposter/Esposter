# Terrain, ground paint and wind

Read when a region's ground streams or is painted, or anything moves in the wind.

- **The ground streams; nothing places a heightfield by hand.** A region's heights and colours reach the ground only through the terrain worker (`packages/genshin-world/src/workers/terrainTile.worker.ts`), and everything placed in the world sits inside the floating origin's world group, so a shift moves it with the ground (`openspec/specs/genshin/terrain/design.md`).

- **There is one wind.** Anything that moves in the wind samples `createWindNode` over the world's `WindUniforms`, never a sway of its own, so a gust moves the grass, the crowns and the clouds together (`openspec/specs/genshin/vegetation/design.md`).

- **Ground is painted by its layers, placed where its terrain places them.** A region's ground colour is `createGroundPaintColor` over its `GroundPaint`, its layers' shares read from its fitted field (`layerField`) and its rules laid over them, weights solved per vertex in the terrain worker as the game holds its per texel, never a colour function written by hand (`openspec/specs/genshin/ground-paint/design.md`).
