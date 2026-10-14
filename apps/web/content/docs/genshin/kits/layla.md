---
title: Layla
description: Layla's kit as built, with her strikes, charged attack, plunges, Nights of Formal Focus's hit and shield, and Starlight Slug's field, and what is left of her Night Stars and passives.
---

# Layla

Layla's kit is its record and one behaviour module, `createLaylaKitBehaviour`, on avatar 10000074: three strikes, a charged attack of two slashes, a collision and two plunges, Nights of Formal Focus with its Cryo hit and the shield it sets on the team, and Starlight Slug's field, which strikes from the body's place every 1.5 seconds for twelve seconds. Her multipliers are read from proud skill groups 7431, 7432 and 7439; the charged attack's stamina, the skill's cooldown and shield, and the burst's cooldown and energy cost are read from the same groups. The burst's strike is its share of her Max HP as flat damage, which her talent multiplier does not scale. Starlight Slug's tick reaches every enemy within 13.5 metres of the body, where gcsim picks the closest one, which overstates a tick against several enemies. Her Night Stars are not built, nor are her Ascension and Constellation passives. Her plunges take Bennett's timings and poise.

## Decisions

- **Layla's plunges take Bennett's timings and poise.** gcsim has no plunge file for her, so `laylaKit.ts` lands the collision, low and high plunge at Bennett's frames, 36 for the low hit and 38 for the high, with 100 and 150 poise and her own multipliers. Her animation would move them if it showed otherwise.

## Key files

| File                                                             | Role                                                                                                                                                                     |
| :--------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/laylaKit.ts` | `createLaylaKitBehaviour`, Layla's kit with her strikes, charged attack and plunges, Nights of Formal Focus's hit and shield, and Starlight Slug's field and its strikes |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/layla), MIT: Layla's strikes' hitmarks, cancel frames and reaches, the charged attack's slashes, Nights of Formal Focus's hit, frames and shield, and Starlight Slug's field, its ticks, release and travel.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Layla's own folder has none.
