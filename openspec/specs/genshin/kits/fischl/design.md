# Fischl

Fischl's kit is its record and one behaviour module, `createFischlKitBehaviour`, avatar 10000031: five arrows, a fully charged aimed shot, a collision and two plunges, Nightrider's Oz and Midnight Phantasmagoria. Her multipliers are read from proud skill groups 3131, 3132 and 3139, and match the wiki's Bolts of Downfall, Nightrider and Midnight Phantasmagoria values to two decimal places, Oz's attack at 3132's first parameter and its summoning damage at its second; the skill's duration and cooldown and the burst's cooldown and cost are read from the same groups. Oz is a summon that spawns 18 frames into the press, or 113 into the burst, and attacks every 59 frames while it stands; one stands at a time, a new one ending the one standing, and a swap during the burst spawns its Oz at once. Undone Be Thy Sinful Hex's Thundering Retribution from Ascension 4, and Gaze of the Deep's, Devourer of All Sins', Her Pilgrimage of Bleak's and Evernight Raven's effects from one, two, four and six constellations answer the kit events below. Stellar Predator, the skill's recast, the particles and her Hexerei kit are not built.

## Decisions

- **Oz's attack is group 3132's first parameter and its summoning damage its second**, as gcsim's "birdAtk" and "birdSum" and the wiki's 88.8% and 115.44% give them. Oz's summon deals the wiki's 80 poise and its attacks 10 under the Elemental Skill internal cooldown, and Midnight Phantasmagoria the wiki's 2U where gcsim gives 1U.
- **One Oz stands at a time.** A press or a burst ends the Oz standing as it casts its own, as the wiki's burst resets his duration, and Oz stands from its spawn frame (`spawnSeconds`) for what reads whether it is on the field.
- **Thundering Retribution strikes the enemy that reacted.** gcsim lands it at the primary target, a circle of 0.5 metres, and the wiki's targeting of the enemy nearest the character is not built. Its half-second interval is kept on the character on the field, as gcsim keeps it. It is dealt as Elemental Skill DMG, gcsim's tag for it, so Yoimiya's Aurous Blaze explodes on it.
- **Gaze of the Deep and Evernight Raven reach what the attack they join reaches.** Each lands from the body with that hit's area, so Gaze of the Deep strikes along with Fischl's own arrow and Evernight Raven along with whoever is on the field.
- **Her Pilgrimage of Bleak heals a frame after the full Oz's spawn, swap or not.** A task runs 114 frames into the burst; gcsim heals after whichever spawn comes, and the wiki confirms the heal on a swap.
- **The swap's Oz spawns a frame after the swap**, its first attack 63 frames later, gcsim's frames with no swap delay of its own.

## Key files

| File                                                              | Role                                                                                                            |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/fischlKit.ts` | `createFischlKitBehaviour`, Fischl's kit with Oz, its swap spawn, Thundering Retribution and her constellations |

## Sources

- [Nightrider](https://genshin-impact.fandom.com/wiki/Nightrider), [Midnight Phantasmagoria](https://genshin-impact.fandom.com/wiki/Midnight_Phantasmagoria), [Undone Be Thy Sinful Hex](https://genshin-impact.fandom.com/wiki/Undone_Be_Thy_Sinful_Hex), [Gaze of the Deep](https://genshin-impact.fandom.com/wiki/Gaze_of_the_Deep), [Her Pilgrimage of Bleak](https://genshin-impact.fandom.com/wiki/Her_Pilgrimage_of_Bleak) and [Evernight Raven](https://genshin-impact.fandom.com/wiki/Evernight_Raven), Genshin Impact Wiki: Oz's and the burst's gauges, poise and internal cooldowns, the Electro-related reactions Thundering Retribution answers and its interval, and the notes on the coordinated attacks and the heal on a swap.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/fischl), MIT: Fischl's multipliers' order, Oz's spawn, ticks and the burst's spawn on a swap, Thundering Retribution's and the constellations' areas, delays and multipliers.
