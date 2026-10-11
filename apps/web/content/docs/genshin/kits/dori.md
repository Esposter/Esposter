---
title: Dori
description: Dori's kit as built: her three strikes, a provisional charged attack, a collision and two plunges, Troubleshooter Shot with its After-Sales Service Round, and Alcazarzaray's Exactitude's Connector field, with her healing, energy and passives left unbuilt.
---

# Dori

Dori's kit is one module, `createDoriKit`, avatar 10000068: three strikes, a charged attack, a collision and two plunges, Troubleshooter Shot with its After-Sales Service Round, and Alcazarzaray's Exactitude's Connector field. Her multipliers are read from proud skill groups 6831, 6832 and 6839; the skill's cooldown, the burst's cooldown, energy cost and duration, and the charged attack's stamina and maximum duration come from the same groups. The particles are not built.

Not yet built: Continuous Healing and Energy Regeneration, which the burst's own clock of 11, 131 and every 120 frames sets and which no field can yet heal on; the Electro infusion the burst gives Dori herself, which waits on a hook that infuses the kit's own character; and the passives and constellations, which wait on the passive hook.

## Decisions

- **The charged attack is provisional.** gcsim has no charged attack for Dori, so the spin and the final hit take the table's multipliers, its stamina per second and its maximum duration, and the spin lands at the start. The timings are a best estimate until a recording of the attack settles them.
- **The Connector ticks run to 772 frames, past the table's 12 seconds.** gcsim runs its 32 ticks on their own schedule, with no duration check, so the field lasts until the last of them, as gcsim has it.
- **The After-Sales Service Round lands from the skill's spot.** Its two hits are the skill's own, at 72 and 85 frames, past its 44-frame animation, where gcsim queues them off the first hit's landing, which is the same moment as the skill's 26-frame hitmark.

## Key files

| File                                                            | Role                                                                                                        |
| :-------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/doriKit.ts` | `createDoriKit`, Dori's kit with Troubleshooter Shot, its After-Sales Service Round and the Connector field |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/dori), MIT: Dori's strikes' hitmarks, cancels and poise, Troubleshooter Shot's hitmark and After-Sales Service Round's hits, Alcazarzaray's Exactitude's Connector ticks, and the low and high plunges' hitmarks and poise.
