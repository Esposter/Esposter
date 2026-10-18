# Xinyan

Xinyan's kit is its record and one behaviour module, `createXinyanKitBehaviour`, on avatar 10000044: four blunt strikes, a charged attack of two hits, a collision and two plunges, Sweeping Fervor with its shield, which steps up to Lead-In and Rave by the enemies it strikes and Rave's Pyro DoT, and Riff Revolution with its Physical hit and seven Pyro DoT hits. Her multipliers are read from proud skill groups 4431, 4432 and 4439; the charged attack's stamina, the shield's seconds and its DEF and flat shares at each level, the skill's cooldown and the burst's cooldown and energy cost are read from the same groups. Ascension 1 and Constellations 2 and 4 are built. Ascension 4 is not, as no kit event reaches the team's shield, Constellation 1 is not, as the kit's normal attack speed reads only an infusion's, and Constellation 6 is not, as gcsim has none. The charged attack has no gcsim source, so its reach, frames and poise stand in as the fourth strike's.

## Decisions

- **Sweeping Fervor's shield steps up on a count its hit keeps, and its level lives beside the shield.** The hit counts each enemy it strikes on a status that carries `KitStatus.stacks` for the hit's window, and each count raises the shield to the level it reaches, Lead-In at 2 and Rave at 3, Ascension 1 lowering each by one. The level is a status that lasts as long as the shield, so a shield that breaks takes it with it. Rave's Pyro DoT is a field that strikes every 2 seconds while the shield stands at level 3. The shield is set at the press when none stands. gcsim queues each level 13 frames after the hit, and here the level is decided at the strike.

## Key files

| File                                                              | Role                                                                                                                                                |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/xinyanKit.ts` | `createXinyanKitBehaviour`, Xinyan's kit with Sweeping Fervor's shield and its Pyro DoT, and Riff Revolution's Physical hit and seven Pyro DoT hits |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xinyan), MIT: Xinyan's strikes' hitmarks, cancels, reaches and poise, Sweeping Fervor's hit and shield levels, Rave's DoT, Riff Revolution's hit, DoT and Constellation 2's pulses, and her Ascension 1 and Constellations 2 and 4.
