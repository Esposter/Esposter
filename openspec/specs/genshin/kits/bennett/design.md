# Bennett

Bennett's kit is its record and one behaviour module, `createBennettKitBehaviour`, avatar 10000032: five strikes, a charged attack, a collision and two plunges, Passion Overload's press and its two Charge Levels, and Fantastic Voyage's damage. Its multipliers are read from proud skill groups 3231, 3232 and 3239, and match the wiki's Strike of Fortune, Passion Overload and Fantastic Voyage values to two decimal places. Fantastic Voyage's field, its heal, its ATK bonus and its constellations 1 and 6 are built, as the shared effects below, and A1's and A4's cooldown cuts, and A4's no-launch of the Level 2 hold, are built with them. Its self infusion is left.

## Decisions

- **A field's tick reads the character on the field.** Fantastic Voyage's heal and ATK bonus go to the character standing in the circle, not to each member of the team, as gcsim applies them.
- **Fantastic Voyage infuses only at constellation 6.** Its tick infuses nobody below 6. Grand Expectation at 1 lifts the ATK bonus's HP threshold to any HP above zero and adds 20% of Bennett's base ATK to it, so a character under 70% of its HP gets the bonus. At 6, the bonus's branch also gives the character on the field a 15% Pyro DMG Bonus whatever it wields, and Pyro on its weapon if it wields a sword, claymore or polearm, for the buffs' 2.1 seconds, from the wiki's [Fire Ventures With Me](https://genshin-impact.fandom.com/wiki/Fire_Ventures_With_Me) and gcsim's burst.go, which give the same wielders. The wielder is the combatant's `weaponType`, which the world's combat fills from the roster's table it already holds.
- **Fearnaught's no-launch is the Level 2 hold's shorter animation.** Inside Fantastic Voyage's field at Ascension 4, the Level 2 hold plays gcsim's 175 frames in place of 343, with the same two hits and explosion, all of which land before it ends. The wiki's Fearnaught page gives the effect, and gcsim the animation. Bennett's launch is not modelled, so only the animation changes.
- **Bennett's hold boxes are circles.** The 3 by 3 box of the hold's second hit is priced as the circle to its far corner, 2.12 metres, as the other boxes are.

## Provisional constants

- **Passion Overload's Charge Levels' thresholds are provisional.** The hold that reaches Level 1 is 0.5 seconds and Level 2's is 1 second, and no table or wiki page gives them, so the roadmap's References sought list holds `bennett-charge-levels.mkv` to measure them. The hold's hits and explosion, their multipliers and poise, and the cooldowns of 7.5 and 10 seconds are the wiki's and gcsim's.

## Not built

- **Bennett's self infusion is left.** "ApplySelfInfusion" puts a 1U Pyro aura on the character on the field each tick, [gcsim v2.47.2](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/burst.go) (MIT), an elemental aura and not a weapon infusion. Its aura on Bennett is not built. The wiki's Fire Ventures With Me page says the C6 infusion and bonus also apply when the field heals a character under 70%, where gcsim applies them on the ATK bonus alone; the kit follows gcsim, and the two differ on that case.

## Key files

| File                                                               | Role                                                                                                          |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/bennettKit.ts` | `createBennettKitBehaviour`, Bennett's kit with Passion Overload's Charge Levels and Fantastic Voyage's field |

## Sources

- [Strike of Fortune](https://genshin-impact.fandom.com/wiki/Strike_of_Fortune), [Passion Overload](https://genshin-impact.fandom.com/wiki/Passion_Overload) and [Fantastic Voyage](https://genshin-impact.fandom.com/wiki/Fantastic_Voyage), Genshin Impact Wiki: Bennett's advanced properties, gauges, poise and the field's heal and ATK bonus.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/bennett), MIT: the kit's hitmarks, cancel frames and areas, areas and the field's ticks.
- [Grand Expectation](https://genshin-impact.fandom.com/wiki/Grand_Expectation) and [Fire Ventures With Me](https://genshin-impact.fandom.com/wiki/Fire_Ventures_With_Me), Genshin Impact Wiki: Bennett's C1 and C6, and the C6 page's note on which wielders the bonus and the infusion reach, and when they apply.
