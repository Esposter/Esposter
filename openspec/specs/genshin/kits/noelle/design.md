# Noelle

Noelle's kit is its record and one behaviour module, `createNoelleKitBehaviour`, on avatar 10000034: four strikes, a charged attack, a collision and two plunges, Breastplate's press and Sweeping Time's two slashes. Her multipliers are read from proud skill groups 3431, 3432 and 3439, and match the wiki's Favonius Bladework - Maid, Breastplate and Sweeping Time values to two decimal places. Breastplate's shield, its heal, and its constellations I Got Your Back and To Be Cleaned, and Sweeping Time's converted Geo attacks and ATK bonus are built, as the [shared effects](../README.md).

## Decisions

- **Breastplate's shield is set from Noelle's DEF.** It holds 160% of her DEF plus 769 for 12 seconds, and is recast over the one she holds. From four constellations, To Be Cleaned explodes it for 400% of her ATK of Geo as it ends, 2U under the Elemental Skill internal cooldown with 100 poise. The explosion is priced by Noelle as she stood when she cast the shield, and lands on the ground where the character on the field stands, since the shield protects whoever is on the field. The recast ends the shield it replaces, so that one's explosion goes off too. The wiki gives the explosion no area, so it reaches as far as the shield does.
- **Breastplate's heal rolls on her attacks while the shield stands.** Her normal and charged attacks' hits and her press carry the roll at 50% (the wiki's level-1 chance), which I Got Your Back makes certain while Sweeping Time's Geo infusion is up, from one constellation, and a hit rolls on each enemy it strikes until one passes. A pass heals every party member by 21.28% of Noelle's DEF plus 102.7, each as a share of its own Max HP. The roll reads the world's one seeded random source, which the world screen holds and every combat roll draws on, the strikes' CRIT rolls included, so a session's rolls repeat. Plunges do not roll, as gcsim's do not.
- **Sweeping Time converts her normal attacks to their own poise.** An infusion that converts its attacks (`isConverted`) gives each normal attack hit its converted poise, 132.25, 122.82, 143.865 and 189.75 from the wiki. Her charged attack, collision and plunges have the same poise converted as normal, so they are unchanged. The Geo infusion and the ATK bonus of 40% of her DEF are built, for 15 seconds past an 80-frame start.
- **Ascension 1 and 4 are passives on her module.** Devotion shields the active character with 400% of her DEF for 20 seconds when a drain takes it under 30% HP, from Ascension 1, once every 60 seconds; the drain must name its source, as an enemy's strike does not. From Ascension 4, each fourth normal or charged attack that strikes an enemy cuts the skill's cooldown by a second, counting each attack once on its first enemy, and a skill restarts the count, as gcsim's makeA4CB does.
- **Noelle's charged attack is one cycle of its spin and its final slash.** A held spin's cycles are not built, so the charged attack hits once and then once more.

## Key files

| File                                                              | Role                                                                                                                                       |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/noelleKit.ts` | `createNoelleKitBehaviour`, Noelle's kit with Breastplate's shield, heal and constellations, and Sweeping Time's buffs and converted poise |

## Sources

- [Favonius Bladework - Maid](https://genshin-impact.fandom.com/wiki/Favonius_Bladework_-_Maid), [Breastplate](https://genshin-impact.fandom.com/wiki/Breastplate) and [Sweeping Time](https://genshin-impact.fandom.com/wiki/Sweeping_Time), Genshin Impact Wiki: Noelle's strikes', charged attack's and plunges' poise, Breastplate's gauge, poise and shield, and Sweeping Time's damage, poise and infusion.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/noelle), MIT: the kit's hitmarks, cancel frames and areas, the shield's size and duration, and Sweeping Time's buff length.
