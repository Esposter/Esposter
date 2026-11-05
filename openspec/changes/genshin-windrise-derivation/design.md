# Windrise derivation

The [scene derivation](../../specs/genshin/scene-derivation/design.md) page keeps the layout pass and the Windrise stand-ins as built. Two passes remain before the open world matches the game's own data.

## Decisions

- **A stand-in is ranked before it is rebuilt.** Each one is scored against its export by the parity loss table, which `genshin:parity rank` prints without committing it, and the lowest-ranked are rebuilt first, so a rebuild is judged by the same gate as the rest of the frame.
- **A rebuilt stand-in is drawn from the engine's own generators.** The Snezhnaya kits draw their geometry from `genshin-engine`'s generators (`createBoxesGeometry`, `createLatheStackGeometry`), and a rebuilt stand-in does the same, with the game's meshes kept to the witness the rank scores against. Rebuilding from the game's exported meshes was rejected: a stand-in drawn from the mesh it is scored against would score as the game does, so the rank would measure nothing. Ranking without rebuilding was rejected: the table would order stand-ins that nothing replaces, and the light and haze would have no rebuilt objects to fit over.
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
