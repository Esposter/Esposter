# Chasca

Chasca's kit is its record and one behaviour module, `createChascaKitBehaviour`, on avatar 10000104: four normal attacks with the third of two hits, the fully-charged Aimed Shot, a collision and a low plunge, Spirit Reins' Resonance, and Galesplitting Soulseeker Shell's first hit. Her multipliers are read from proud skill groups 10431, 10432 and 10439, and match gcsim's values to four decimal places.

## Decisions

- **Her normal attacks are the kit's four strikes.** Each is a box of 0.1 by 1 metre half a metre ahead of her, the Sethos box. Her third attack is two hits at 14 and 20 frames, and her fourth one hit at 39, as gcsim queues it, although the game's table names three hits for the fourth. Her strike animations are gcsim's walk-cancel frames: 27, 29, 53 and 73.
- **Her charged attack is the fully-charged Aimed Shot.** It lands at 86 frames of its 96-frame animation, an Anemo hit on the same box as her strikes, with no Poise. A bow's charged attack spends no stamina, so its stamina is 0.
- **Her collision and low plunge are gcsim's.** The collision lands at 44 frames, a circle of radius 1.5 on her. The low plunge lands at 50 frames of 80, with the plunge radius of 3.
- **Galesplitting Soulseeker Shell is the burst's first hit, at 96 frames of its 114.** It is an Anemo circle of radius 6 on the primary target. Its cost is 60 energy and its cooldown 15 seconds, both from the table.
- **Spirit Reins' Resonance lands at 3 frames, a circle of radius 5.5 round her.** Its press lets the next action start 6 frames later, gcsim's earliest cancel, and its cooldown is the table's 6.5 seconds. gcsim runs that cooldown from the end of the Blessing, which is not built, and a press here starts it at once instead.
- **The high plunge is provisional.** gcsim gives its multiplier but no hitmark, so it lands with the low plunge's 50 frames in the high plunge's radius of 5. The [roadmap](../../../../changes/genshin-roadmap/tasks.md) asks whether it lands there.

## Not built

- **The Nightsoul Blessing is not built.** The skill's press would start it, replacing her strikes and Aimed Shot with the Blessing's own until its Nightsoul points end it; the index lists the framework gaps it waits on.
- **The Blessing's flight and its Shadowhunt Shells are not built.** While in the Blessing she flies and fires Shadowhunt Shells at her aim. The framework's locomotion has Jump and Fall but no flight state, so the flight and the shells wait on a flight hook.
- **The five shells after Galesplitting are not built.** Each of the burst's Soulseeker and Radiant Shells is Anemo or the party's element, the Radiant ones taking the team's elements in turn. A kit step cannot read the party's elements yet, so only the first hit is built.
- **Ascension passives and constellations are not built.** They are the passives of the [character kits proposal](../../../../changes/genshin-character-kits/design.md) and the [constellations](../../../../changes/genshin-constellations/design.md) page's.

## Key files

| File                                                              | Role                                                                                                                                  |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/chascaKit.ts` | `createChascaKitBehaviour`, Chasca's kit with her strikes, fully-charged Aimed Shot, plunges, Resonance and Galesplitting's first hit |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/chasca), MIT: the kit's hitmarks, animations, reach and the plunges' radii, and the proud group indices behind each multiplier.
- [Hosted game data](../../hosted-game-data/design.md): the avatar's talent groups 10431, 10432 and 10439, read from the talent and skill kit tables.
