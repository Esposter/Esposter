---
title: Sayu
description: Sayu's kit as built: Fuufuu Windwheel's press, short hold and roll, and Mujina Flurry's field and Muji-Muji Daruma ticks, with her passives, constellations and the roll's elemental kick left unbuilt.
---

# Sayu

Sayu's kit is its record and one behaviour module, `createSayuKitBehaviour`, on avatar 10000053: four strikes, a charged attack of two hits, a collision and two plunges, Fuufuu Windwheel's press, its short hold and its roll, and Yoohoo Art: Mujina Flurry with Muji-Muji Daruma. Her multipliers are read from proud skill groups 5331, 5332 and 5339. The press is a Windwheel DoT and a kick. The short hold is a DoT and a kick at 48 frames. The roll is a level for each whole second held up to 10, with a DoT tick every half second, a kick at its end, and a cooldown that grows by half a second per second held. Mujina Flurry's initial hit is followed by a field that heals the active character by its flat amount and ATK share at the cast, and by a summon of six Daruma ticks, each striking what is in reach and healing the active character while it is at 70% HP or under. Her passives and constellations are not built, and the roll's elemental kick is not, as the kit has no absorption check to read. The charged attack and the plunges are provisional, and each Daruma tick strikes and heals together, where gcsim strikes only when no heal is due.

## Decisions

- **Sayu's roll is one hold level for each whole second held.** The hold a release plays is the last level whose seconds it reaches, so each level carries its own ticks, kick, animation and cooldown. gcsim's roll takes its frames exactly, so a release part way through a second plays the level below it.
- **Sayu's short hold begins at half a second.** No table or wiki page gives a hold's seconds, so it starts at Venti's 0.5 seconds, as Kazuha's hold does.
- **Sayu's charged attack and plunges are read from the table.** gcsim gives the charged attack no hitbox, so its two hits take the table's charged slots at half a second and a second, with 40 flat stamina; her plunges land at half a second.

## Key files

| File                                                            | Role                                                                                                                                               |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/sayuKit.ts` | `createSayuKitBehaviour`, Sayu's kit with Fuufuu Windwheel's press, short hold and roll, and Mujina Flurry with Muji-Muji Daruma's ticks and heals |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/sayu), MIT: Sayu's strikes' hitmarks, reaches, cancel frames and poise, the Windwheel's DoT and kick circles and frames, the roll's ticks and the short hold, and Mujina Flurry's initial hit, Muji-Muji Daruma's ticks and their frames.
