# Chongyun

Chongyun's kit is its record and one behaviour module, `createChongyunKitBehaviour`, avatar 10000036: four strikes, a charged attack of two slashes with its stamina a second, a collision and two plunges, Spirit Blade: Chonghua's Layered Frost with its field, and Spirit Blade: Cloud-Parting Star's three blades. His multipliers are read from proud skill groups 3631, 3632 and 3639, and match the wiki's Demonbane, Spirit Blade: Chonghua's Layered Frost and Cloud-Parting Star values to two decimal places; the skill's infusion seconds, cooldown and field seconds, and the burst's cooldown and energy cost are read from the same groups. The field is a circle of radius 8 centred 1.5 metres ahead of him, which infuses a sword, claymore or polearm wielder on the field with Cryo each second while it stands in the field, and whoever a swap brings on while it stands, as the shared infusion above; a press ends the field standing. Steady Breathing's Normal ATK SPD from Ascension 1 rides the infusion, Rimechaser Blade strikes as the field ends from Ascension 4, and Ice Unleashed's blades, Atmospheric Revolution's cooldown cut, Frozen Skies' energy and Rally of Four Blades' fourth blade and DMG Bonus come from one, two, four and six constellations. The charged attack is provisional, and the particles are not built.

## Decisions

- **Layered Frost infuses only a sword, claymore or polearm wielder**, as gcsim and the wiki give it and Fantastic Voyage's infusion does (`MELEE_WEAPON_TYPES`), and Steady Breathing's 8% Normal ATK SPD rides the infusion for its seconds, as gcsim adds them together. A swap infuses the character coming on wherever it stands, as gcsim's swap hook does.
- **A press ends the frost field standing**, so its Rimechaser Blade strikes then. The blade lands 655 frames after the press, gcsim's, at the enemy the targeting scores highest within the field round its centre, or at the centre, priced by Chongyun as he stands at the field's end where gcsim holds him as he pressed.
- **Atmospheric Revolution is the field's cooldown multiplier**, read where the skill or burst is cast, as the talent's "cast within the Frost Field" reads, where the wiki's note keeps it while the infusion would hold.
- **Frozen Skies gives 1 energy**, the game's text, where gcsim gives 2, for any of Chongyun's hits on an enemy with Cryo on it while he is on the field.

## Provisional constants

- **Chongyun's charged attack is provisional.** gcsim marks its spinning and final slashes not implemented, so they are priced at half a second and a second, with the attack ending at 1.2 seconds.
- **Ice Unleashed's blades reach what the fourth strike reaches, and the fourth Cloud-Parting Star blade the other blades' 5 metres**, both provisional, as gcsim's circles on the primary target hold no area here.

## Key files

| File                                                                | Role                                                                                                                  |
| :------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/chongyunKit.ts` | `createChongyunKitBehaviour`, Chongyun's kit with the frost field's infusion, Rimechaser Blade and his constellations |

## Sources

- [Steady Breathing](https://genshin-impact.fandom.com/wiki/Steady_Breathing), [Rimechaser Blade](https://genshin-impact.fandom.com/wiki/Rimechaser_Blade), [Ice Unleashed](https://genshin-impact.fandom.com/wiki/Ice_Unleashed), [Atmospheric Revolution](https://genshin-impact.fandom.com/wiki/Atmospheric_Revolution), [Frozen Skies](https://genshin-impact.fandom.com/wiki/Frozen_Skies) and [Rally of Four Blades](https://genshin-impact.fandom.com/wiki/Rally_of_Four_Blades), Genshin Impact Wiki: Chongyun's passives' and constellations' text, gauges and poise.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/chongyun), MIT: the infusion's wielders and Steady Breathing beside it, the swap's infusion, Rimechaser Blade's frame, area and target, Ice Unleashed's blades and the fourth Cloud-Parting Star blade.
