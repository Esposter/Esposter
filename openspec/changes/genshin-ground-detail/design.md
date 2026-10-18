# Ground detail

The [ground paint](../../specs/genshin/ground-paint/design.md) page paints each layer in a pair of colours and no texture, so the ground draws no detail of its own. The detail the scene does draw is each surface's octave noise, fitted to the statistics of its export's texture, which are counted in that texture's texels. Every texture's texel was drawn at one constant of 4 centimetres, so the base maps' detail, at 2 metres a texel, lands 50 times too fine where the plant domes draw it.

## Decisions

- **A detail carries its own texture's metres per texel.** Its band energies are measured in its texture's texels, so it holds the metres a texel spans where the texture is drawn, and its octaves are drawn at that scale. The surface fit measures it off the faces it reads through the texture, their world area over the texels their UVs cover: a base map reads 2 metres on the flat, 512 texels over its 1,024-metre tile, and 2.3 over Windrise's tiles, whose slopes add area, while the oak's, the paving's and the statue's textures read 8, 10 and 6 millimetres, not the 4 centimetres the constant gave them. No constant stands in for it, and the material reads it as a uniform, so a part's texture scale costs no program of its own.
- **The ground's detail is its layers' textures, never its base map.** A base map's 2-metre texel holds the tiles' layout, which the layer field and the layers' colours already paint. The game draws its ground's detail from each splat layer's own texture, tiled at the repeat the tile's splat database gives it, 4 to 16 metres ([game data formats](../../specs/genshin/game-data-formats/design.md)), so a layer's metres per texel is its repeat over its texture's width: one value for each texture.
- **The layers' detail is built only once the surface pass asks for it.** The ground paint page adds a per-pixel layer node only if the Ground's structure, read with its layers drawn, misses its gate; a hold rejects the third step.

## Scope

1. [x] Every surface's detail carries its texture's metres per texel, measured by the surface fit, and the shared constant goes.
2. [x] The surface pass reads the Ground's structure with its layers drawn, and every family's with its detail at its own scale. Its reading, the decision input for the third step: the Ground's structure misses its gate by a wide margin, so the third step is built, not rejected, and the gate is the run's own sampling floor, not the one the queue item names. Its scale-by-scale diagnostic falls off from the finest scale, and the Ground colour misses its ΔE gate too. The Statue, Paving and Oak structures miss theirs as well. The readings are in the surface pass's snapshot.
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
