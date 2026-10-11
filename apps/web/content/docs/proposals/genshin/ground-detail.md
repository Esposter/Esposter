---
title: Ground detail
description: Proposal — the ground's fine detail at the game's own scale. Every surface's detail carries its own texture's metres per texel, measured off the faces the texture is read over, in place of one constant every texture shared; the ground's layers then take the detail of their own textures, each at its repeat over its size, once the surface pass's structure asks for it.
model: claude-opus-5-5
needs: [game-exports]
---

# Ground detail

The [ground paint](/docs/genshin/ground-paint) page paints each layer in a pair of colours and no texture, so the ground draws no detail of its own. The detail the scene does draw is each surface's octave noise, fitted to the statistics of its export's texture, which are counted in that texture's texels. Every texture's texel was drawn at one constant of 4 centimetres, so the base maps' detail, at 2 metres a texel, lands 50 times too fine where the plant domes draw it.

## Decisions

- **A detail carries its own texture's metres per texel.** Its band energies are measured in its texture's texels, so it holds the metres a texel spans where the texture is drawn, and its octaves are drawn at that scale. The surface fit measures it off the faces it reads through the texture, their world area over the texels their UVs cover: a base map reads 2 metres, 512 texels over its 1,024-metre tile, and each mesh texture its own. No constant stands in for it.
- **The ground's detail is its layers' textures, never its base map.** A base map's 2-metre texel holds the tiles' layout, which the layer field and the layers' colours already paint. The game draws its ground's detail from each splat layer's own texture, tiled at the repeat the tile's splat database gives it, 4 to 16 metres ([game data formats](/docs/genshin/game-data-formats)), so a layer's metres per texel is its repeat over its texture's width: one value for each texture.
- **The layers' detail is built only once the surface pass asks for it.** The ground paint page adds a per-pixel layer node only if the Ground's structure, read with its layers drawn, misses its gate; a hold rejects the third step.

## Scope

1. [ ] Every surface's detail carries its texture's metres per texel, measured by the surface fit, and the shared constant goes.
2. [ ] The surface pass reads the Ground's structure with its layers drawn, and every family's with its detail at its own scale.
3. [ ] Windrise's splat layers' diffuse textures exported, each layer's detail fitted off its texture at its repeat over its width into the ground surface's layers, and drawn on the terrain by the layers' weights. Open: how the weights reach the material, as vertex attributes morphed with the colour or as the detail of the layer weighing most, since every layer's octaves summed costs five noise calls a layer for each pixel.
4. [ ] Each other region's ground in its own layers: its field from its tiles' cells, its colours from its base maps and its detail from its layers' textures. Only Windrise's component exports its tiles' base maps, so each region's colours wait on its own.

## Key files

| File                                                                     | Role                                                                     |
| :----------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `packages/genshin-engine/src/models/nodes/SurfaceDetail.ts`              | A surface's detail: its texture's band energies, variance and texel size |
| `packages/genshin-engine/src/nodes/computeSurfaceOctaves.ts`             | The octaves' amplitudes, and their frequencies at the texture's scale    |
| `packages/genshin-engine/src/nodes/createSurfaceDetailNode.ts`           | A detail's octaves drawn as noise at its texture's scale                 |
| `scripts/src/services/genshinAssets/fit/fitSurfaceColours.ts`            | Each texture's detail and the metres per texel its faces draw it at      |
| `scripts/src/services/genshinAssets/world/parseTerrainSplat.ts`          | Each splat layer's diffuse texture and its repeat                        |
| `packages/genshin-engine/src/terrain/createTerrainMaterial.ts`           | The ground's material, which the layers' detail multiplies               |
| `packages/genshin-engine/src/terrain/createGroundPaintColor.ts`          | A vertex's colour by its layers' weights                                 |
| `packages/genshin-world/src/components/World/Screen/Ground.reference.ts` | The ground's reference frame and the measures it was scored against      |
