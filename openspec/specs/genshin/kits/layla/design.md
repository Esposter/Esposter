# Layla

Layla's kit is its record and one behaviour module, `createLaylaKitBehaviour`, on avatar 10000074: three strikes, a charged attack of two slashes, a collision and two plunges, Nights of Formal Focus with its Cryo hit and the shield it sets on the team, and Starlight Slug's field, which strikes from the body's place every 1.5 seconds for twelve seconds. Her multipliers are read from proud skill groups 7431, 7432 and 7439; the charged attack's stamina, the skill's cooldown and shield, and the burst's cooldown and energy cost are read from the same groups. The burst's strike is its share of her Max HP as flat damage, which her talent multiplier does not scale. Starlight Slug's tick reaches every enemy within 13.5 metres of the body, where gcsim picks the closest one, which overstates a tick against several enemies. Her Night Stars are not built, nor are her Ascension and Constellation passives. Her plunges take Bennett's timings and poise.

## Decisions

- **Layla's plunges take Bennett's timings and poise.** gcsim has no plunge file for her, so her record lands the collision, low and high plunge at Bennett's frames, 36 for the low hit and 38 for the high, with 100 and 150 poise and her own multipliers. Her animation would move them if it showed otherwise.
- **Constellation 1's Curtain absorbs 20% more, as its shield's health is scaled.** The shield the skill sets is the one it sets for Layla; the team shields the same constellation gives members not under a Curtain need the Cryo effectiveness a shield does not carry, so they wait.
- **The Shooting Star hit is recorded from gcsim's `shield.go`, and it cannot fire until Night Stars are built.** Its travel is 35, 33, 30 and 28 frames for four, three, two and one Night Stars (`frames.shootingStarTravels`), and its hitmark is the four-star 35. Its circle is 0.8 m, centred on the target (`TargetCentred`), dealt as Ice (gcsim's Cryo) with one unit of gauge and multiplier group 7432 index 1 (`starDmg`, 0.1472 at level 1 to 0.26496 at level 10). Its element, gauge and multiplier are read from gcsim through the named hit of `starDmg`, joined by that multiplier, wherever the queue call sits in the character's folder. Its hitmark is the one value still `Unclassified`, because gcsim's delay for it is the travel of the stars left, which the reader cannot evaluate. Shooting Stars fire only after four Night Stars, which the kit does not build, so the hit cannot fire in play; its Ascension 4 and Constellation 2 rules are written against the record once Night Stars are built.

## Key files

| File                                                             | Role                                                                                                                                                                                           |
| :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/laylaKit.ts` | `createLaylaKitBehaviour`, Layla's kit with her strikes, charged attack, Nights of Formal Focus's hit and shield, and Starlight Slug's field and its strikes; her plunges come from the record |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/layla), MIT: Layla's strikes' hitmarks, cancel frames and reaches, the charged attack's slashes, Nights of Formal Focus's hit, frames and shield, and Starlight Slug's field, its ticks, release and travel.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: the plunges' timings and poise, borrowed as Layla's own folder has none.
