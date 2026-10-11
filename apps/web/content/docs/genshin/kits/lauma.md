---
title: Lauma
description: Lauma's kit as built, with her three strikes, charged attack, provisional plunges, and Hymn of Hunting's press with the Frostgrove Sanctuary it plants, and what is left waiting on the Dew, Lunar-Bloom, Spirit Envoy and Pale Hymn hooks.
---

# Lauma

Lauma's kit is one module, `createLaumaKit`, on avatar 10000119: her three strikes, a charged attack, a plunge collision and two plunges, and Hymn of Hunting's press with the Frostgrove Sanctuary it plants. Her multipliers are read from proud skill groups 11931, 11932 and 11939, and match gcsim's values to six decimal places. The press's cooldown of 12 seconds, the burst's cooldown of 15 and energy cost of 60 are read from the same groups. Her burst lands no hit of its own, so its action has none, and its Pale Hymn is listed below.

## Decisions

- **Her strikes land at their hitmarks, with no travel.** gcsim queues each strike's damage at its hitmark, so the strikes land at 14, 11 and 16 frames in animations of 29, 33 and 38 frames. The first two are boxes of 2 metres by 8 and the third a box of 2.8 metres by 8, each on the body's near edge, as gcsim's boxes are drawn.
- **Her charged attack, Spiritcall Prayer, lands after its animation.** gcsim queues its hit at 73 frames and its animation ends at 68, so the hit lands 5 frames past the action's end. The kit keeps gcsim's hitmark and does not stretch the action to fit it. It is a box of 2.8 metres by 8, and Dendro as her element.
- **The charged attack costs no stamina.** gcsim drains stamina only in the Spirit Envoy state, which is not built, so the charged attack outside it has no cost.
- **The press plants its sanctuary where the body stands.** gcsim places the Frostgrove Sanctuary on the body when the press is cast, and it ticks eight times from 62 frames, every 117 frames, for 15 seconds. Each tick is a circle of 6 metres round that point, dealing Dendro at her ATK share and her Elemental Mastery, and the kit's summon holds those eight hits.
- **The press and each sanctuary tick shed the RES of the Dendro and Hydro enemies they strike.** gcsim gives the shred 2.5% at the first level, for 10 seconds, on each enemy a press or a tick hits. The kit applies it to each enemy a hit strikes as the hit lands, through the enemy status's RES reduction.
- **Her plunges are provisional.** gcsim has no plunge file for Lauma, so the gap is her plunges' timing and poise. The kit shares the plunge reach and takes Bennett's timings and poise, as Nahida's do, with her own table's multipliers. The question is on the [roadmap](/docs/genshin/roadmap).

## Not built

- **Hymn of Eternal Rest waits on the Dew and the Lunar-Bloom hook.** Its hold spends Dew, which the kit holds no resource for, and its second hit is a Lunar-Bloom reaction, which the kit cannot price yet. The hold is not built, so the press alone is the skill.
- **Pale Hymn waits on the reaction hooks.** Her burst adds Pale Hymn stacks, which add Elemental Mastery to each Bloom, Hyperbloom, Burgeon and Lunar-Bloom hit that follows and are spent by them. Those hits are the reactions the kit does not price, so the burst's hit list is empty until they are.
- **The Spirit Envoy state waits on a stance that drains stamina.** Her charged attack's first press, when the state is ready, enters a deer state that drains 25 stamina a second, blocks dashing and ends on any other action. The kit has no stance that drains stamina or ends on an action, so that first press is not built, and the charged attack is always Spiritcall Prayer.
- **Her passives and constellations are not built.** Each reads the Pale Hymn, the Spirit Envoy, or the Lunar-Bloom hook above, or the Frostgrove Sanctuary's own timing.

Talent levels and constellations are read at the level the kit is built at: raising them is the [talents](/docs/proposals/genshin/talents) and [constellations](/docs/proposals/genshin/constellations) pages'.

## Key files

| File                                                             | Role                                                                                                                                            |
| :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/laumaKit.ts` | `createLaumaKit`, Lauma's strikes, charged attack, provisional plunges, and Hymn of Hunting's press with its Frostgrove Sanctuary and RES shred |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/lauma), MIT: each strike's hitmark, animation and box, the charged attack's hit, animation and box, the press's hitmark, animation and circle, the Frostgrove Sanctuary's ticks, duration and circle, the RES shred and its duration, and the burst's animation, read from `attack.go`, `charge.go`, `skill.go` and `burst.go`, with `charge.go` for the stamina.
- The proud skill groups' indices, read from gcsim's `zz_lauma.dm.go` table, which lists each multiplier beside its group.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Lauma's own folder has no plunge file.
