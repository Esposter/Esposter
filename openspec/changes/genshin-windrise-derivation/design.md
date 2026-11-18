# Windrise derivation

The [scene derivation](../../specs/genshin/scene-derivation/design.md) page keeps the layout pass and the Windrise stand-ins as built. Two passes remain before the open world matches the game's own data.

## Decisions

- **A stand-in is ranked before it is rebuilt.** Each one is scored against its export by the parity loss table, which `genshin:parity rank` prints without committing it, and the lowest-ranked are rebuilt first, so a rebuild is judged by the same gate as the rest of the frame.
- **A rebuilt stand-in is drawn from the engine's own generators.** The Snezhnaya kits draw their geometry from `genshin-engine`'s generators (`createBoxesGeometry`, `createLatheStackGeometry`), and a rebuilt stand-in does the same, with the game's meshes kept to the witness the rank scores against. Rebuilding from the game's exported meshes was rejected: a stand-in drawn from the mesh it is scored against would score as the game does, so the rank would measure nothing. Ranking without rebuilding was rejected: the table would order stand-ins that nothing replaces, and the light and haze would have no rebuilt objects to fit over.
- **The ranking prices one stand-in to rebuild, Ground's, so Ground is the first rebuild.** `genshin:parity rank windrise-statue-day --witness windrise` over the whole frame (FLIP 0.7466) prices Ground's stand-in at +0.0075, on 57.7% of the frame. Paving's is +0.0002 on 0.5%, Statue's -0.0006, and Oak's -0.0519: drawing its export would cost the frame, so Oak's stand-in recovers nothing. "Lowest-scoring" reads the loss table's score, a stand-in's ceiling, and not its structural similarity, since similarity ranks Statue (0.369, on 0.8% of the frame) and Oak (0.503) lowest with no cost the frame could recover. The fitted ground stays as it is until a ranking prices a finer one ([scene derivation](../../specs/genshin/scene-derivation/design.md)), and this one does, so the next rebuild is a finer Ground fit. Its representation is not chosen yet: the fit's knobs are `MAX_FEATURES` and `MIN_GAIN_SHARE` in `scripts/src/services/genshinAssets/fit/placeTerrainFeatures.ts` and the 6 metre step, and picking one is a call for the main session, so no fit is queued.
- **The light and haze are the larger cost and wait for the rebuild.** The largest single term is Oak's light in its middle band turned away (0.2058, 23.3% of the frame), and Ground's lit bands sum to about 0.41. Both are the calibration of 1.3, which the change's order runs after the rebuilt objects, since the light is measured against the geometry it falls on.
- **Each hour's light and haze are calibrated over the rebuilt objects.** They are fitted last, since the light and haze read the geometry they fall on.

## Scope

1. Name every object the tile streams at its place from the extraction, the dais and pedestals included.
2. Rank each stand-in against its export and rebuild the lowest first, from the engine's generators.
3. Calibrate each hour's light and haze over the rebuilt objects, and hold each pass by its own gate.

## Key files

| File                                                                    | Role                                                                          |
| :---------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/shared/DerivedAssetComponentMap.ts` | Each component's roots, spawns and landmarks                                  |
| `scripts/src/services/genshinAssets/fit/DerivedAssetFitMap.ts`          | Each component's fit, a region's centre among them                            |
| `scripts/src/services/genshinParity/witness/rankReferenceGains.ts`      | The loss table: every term's ceiling, ordering the stand-ins to rebuild first |
| `packages/genshin-world/src/components/Login/Scene/Index.vue`           | The first scene run through the method                                        |
