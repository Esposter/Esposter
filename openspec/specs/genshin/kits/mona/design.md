# Mona

Mona's kit is its record and one behaviour module, `createMonaKitBehaviour`, on avatar 10000041: four strikes, a charged attack, a collision and two plunges, all Hydro catalyst hits, Mirror Reflection of Doom and Stellaris Phantasm's bubble. Its multipliers are read from proud skill groups 4131, 4132 and 4139, and match the wiki's Ripple of Fate, Mirror Reflection of Doom and Stellaris Phantasm values to two decimal places. Mirror Reflection is a summon, built as the [shared effects](../README.md); the bubble, its explosion and its Omen are built. A1's phantom and A4's Hydro bonus are built too, and Constellation 2's follow-up is built as a Charged Attack's hit after a normal attack. Constellations 1, 4 and 6 and Hexerei's post-burst follow-up are not built.

## Decisions

- **Mona's strikes are priced round her body.** gcsim centres them on the primary target, which an area does not hold yet. Her plunges' reach is provisional.
- **Mona's A1 phantom is cast from a sprint.** `onSprint` spends each 2 seconds of the sprint on a phantom, cast where Mona stands, which explodes at its end for half of Mirror Reflection's explosion. The wiki's check for an opponent within 15 metres is not made: with none in the phantom's 5-metre explosion it deals nothing, so the check changes no damage.
- **Mona's A4 is a passive bonus read as a hit is priced.** `getPassiveBonuses` adds 20% of her Energy Recharge to her Hydro DMG Bonus in `getBuffedCombatant`, for every hit she prices, her summons' included.
- **Stellaris Phantasm's Omen runs from the burst.** Each enemy its cast strikes is held in a bubble for the burst group's first value, 8 seconds. A hit with poise damage bursts the bubble, as its seconds running out do, and the Omen goes on from then: 4 seconds from the burst group's index 3, and the 42% DMG bonus from index 9, which raises the damage of every hit on the enemy. The wiki's exception, that a Frozen enemy takes no poise damage and keeps its bubble, is not modelled, as the enemies' poise does not model it for any hit.
- **Stellaris Phantasm's explosion is single-target.** A burst deals 2U of Hydro with the wiki's 200 poise, at the explosion's multiplier from the burst group's index 1, 442.4% at level 1. A strike with a `target` lands on that one enemy rather than each the area reaches, so the explosion is never spread to a neighbour. It lands on the step after the burst, as a taunt's does, and the Omen does not wait for it.
- **Constellation 2's follow-up is one Charged Attack hit at the normal attack's hitmark.** Each normal attack's last hit has a 20% chance, drawn from the world's seeded source, to be followed by her Charged Attack's hit, at most once in 5 seconds, as gcsim's `cons.go` gives it. gcsim plays a whole Charged Attack 53 frames after the normal attack's hit, and the kit's one hit lands with that hit instead, as an extra hit does, so its damage is the Charged Attack's and its timing is 53 frames early. Her Hexerei post-burst follow-up and the Elemental Mastery share her Charged Attack gives are not built, as Hexerei is not modelled.

## Key files

| File                                                            | Role                                                                                                                       |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/monaKit.ts` | `createMonaKitBehaviour`, Mona's kit with Mirror Reflection's summon, the bubble and its Omen, A1's phantom and A4's bonus |

## Sources

- [Ripple of Fate](https://genshin-impact.fandom.com/wiki/Ripple_of_Fate), [Mirror Reflection of Doom](https://genshin-impact.fandom.com/wiki/Mirror_Reflection_of_Doom) and [Stellaris Phantasm](https://genshin-impact.fandom.com/wiki/Stellaris_Phantasm), Genshin Impact Wiki: Mona's advanced properties, gauges, poise and the phantom's values.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mona), MIT: the kit's hitmarks, cancel frames and areas, the phantom's ticks and explosion, and Constellation 2's follow-up in `cons.go`.
