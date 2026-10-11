---
title: Kirara
description: Kirara's kit as built: four strikes, a charged attack, Tail-Flicking Flying Kick with its shield and holds, and Secret Art: Surprise Dispatch's Cat Grass Cardamoms, with her passives and constellations not built.
---

# Kirara

Kirara's kit is one module, `createKiraraKit`, on avatar 10000061: four strikes, a charged attack of three hits, a collision and two plunges, Tail-Flicking Flying Kick with its shield and Dendro self-infusion, its short hold and its holds of one to ten seconds with Urgent Neko Parcel's cat ticks and Flipclaw Strike's kick, and Secret Art: Surprise Dispatch's box with six Cat Grass Cardamoms, two detonating at 180 frames and four at expiry. Her multipliers are read from proud skill groups 6131, 6132 and 6139; the press's cooldown, the holds' cooldowns, the longest hold, the charged attack's stamina, and the burst's mines' seconds, cooldown and energy cost are read from the same groups. Her passives and constellations are not built, and the short hold's 8.2-second cooldown and the mines' six count are gcsim's own values. The poise, the plunges' seconds and reaches, and the short hold's minimum seconds are provisional.

## Key files

| File                                                              | Role                                                                                                                                                                          |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/kiraraKit.ts` | `createKiraraKit`, Kirara's kit with Tail-Flicking Flying Kick's shield, her short hold and holds, Urgent Neko Parcel and Secret Art: Surprise Dispatch's Cat Grass Cardamoms |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/kirara), MIT: Kirara's strikes' hitmarks, cancel frames and reaches, the charged attack's three circles, Tail-Flicking Flying Kick's fan, the short hold's and the holds' cat ticks and kicks, the shield's duration, and Secret Art: Surprise Dispatch's box, mines and expiry.
