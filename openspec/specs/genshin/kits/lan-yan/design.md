# Lan Yan

Lan Yan's kit is its record and one behaviour module, `createLanYanKitBehaviour`, on avatar 10000108: her four strikes, a charged attack of three hits, a plunge collision and two plunges, and the burst's three hits with Constellation 4's party Elemental Mastery. Her multipliers are read from proud skill groups 10831, 10832 and 10839, matching gcsim's to four decimal places at every talent level from 1 to 15. Her skill's cooldown is 16 seconds, her burst's 15 with a cost of 60 energy, and her charged attack takes 50 stamina.

## Decisions

- **Her strikes and charged attack are gcsim's shapes (`attack.go`, `charge.go`), all Anemo at one unit of gauge.** The first strike is a box of 2.2 by 3 metres offset 0.2 metres back, the second a box of 2.3 by 3, each landing its two hits from the second and third strikes, the third a circle of 2.2 metres ahead by 0.3, and the fourth a fan of 240 degrees of 2.4 metres ahead by 0.5, at 11, 17 and 37, 15 and 21, and 40 frames. Her charged attack is three hits of a circle 2.5 metres centred on the primary target at 42, 49 and 56 frames. Her strikes take the wiki's poise, 25.535 to 72.586 a hit (`Category_Lan_Yan_Talents.json`, Black Pheasant Strides on Water, poises 1 to 6), as gcsim gives none.
- **Her plunges are gcsim's own, not borrowed.** gcsim has a plunge file for Lan Yan, so her low plunge is a circle of 3 metres at 44 frames, her high plunge one of 3.5 metres at 46, and the collision one of 1.5 metres at 38 frames, each in a 67-frame animation. Her high plunge's 3.5 metres differs from Bennett's 5 in gcsim's `bennett/plunge.go`, so it is written here rather than borrowed; her low plunge's 3 metres matches his.
- **Her burst's three hits are circles of radius 6 on the primary target, at 30, 46 and 51 frames.** Each is priced as the targeting area's radius plus its own (`checkIsInAttackArea.ts`), and deals two units of Anemo gauge (the wiki's 2U), from gcsim's 50 durability, in a 100-frame animation (`burst.go`).
- **Constellation 4 adds 60 Elemental Mastery to each member of the deployed team for 12 seconds as the burst is cast.** It is a buff on each member under one source, so a second burst restarts it, as gcsim's party stat mod does (`cons.go` keys the mod `lanyan-c4`, and `pkg/core/player/character/mods.go` overwrites a mod of the same key).
- **Constellation 6's extra charge is a skill-charge bonus, which applies while the press is not built.** The charge is a cooldown property of the skill, not an effect of its press, so it applies from Constellation 6 through `getSkillChargeBonus`; the press's effects wait on the shield and stance hooks. The base is one charge (`maxChargeNum` 1 on skill 11082 in `AvatarSkillExcelConfigData`), and gcsim gives two from Constellation 6 (`lanyan.go`).

- **Ascension 4 adds 774% of her Elemental Mastery to each hit of Lustrous Moonrise, as flat damage.** It is built: gcsim adds it on each burst hit (`burst.go`), the wiki's Skyfeather Evil-Subduing Charm gives 774%, and the kit adds the same share as an additive base damage bonus on each hit (`lanYanKit.ts`).

## Not built

- **The Swallow-Wisp Pinion Dance press deals nothing.** It plays its 49-frame animation, which gcsim gives it when nothing is detected (80 when something is, `skill.go`), and spends its 16-second cooldown, but its detect hit, its Feathermoon Rings and its shield are not built. The rings are a stance, which replaces her normal attacks and skill for 66 frames from the detect (gcsim `skill.go`, `leapBackDuration`), and are not built yet. The shield is cast with the element the detected enemy carries, which the framework cannot read yet, and that wait is the shield's element hook.
- **Ascension 1 (the shield absorbs the element) and Ascension 4's share on the press and its rings wait on the press.** gcsim's Ascension 1 is the shield's absorb (`asc.go`). The wiki's Skyfeather Evil-Subduing Charm gives the press 309% of her Elemental Mastery, and gcsim gives the rings the same flat share (`attack.go`, `Ascension >= 4`). Constellation 1 (the rings' extra hits) waits on it too, and Constellation 2 (the shield restored by a normal attack) waits on the shield hook, since it restores a shield the press casts.

## Key files

| File                                                              | Role                                                                                                                              |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/lanYanKit.ts` | `createLanYanKitBehaviour`, Lan Yan's strikes, charged attack, plunges, burst and Constellation 4, the press waiting on its hooks |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lanyan), MIT: the hitmark, animation and reach of each strike, the charged attack, the plunges' hitmarks and radii, the burst's hits and animation, and the skill's animation, read from its attack, charge, plunge, burst, skill and constellation files.
- The proud skill groups' indices, read from gcsim's data file for the character (`zz_lanyan.dm.go`), which lists the multipliers, cooldowns and costs beside each group. Checked against the game data: all 14 of gcsim's multiplier blocks match their group's `paramList` at every talent level from 1 to 15 (`~/Esposter/genshin-parity/text/ExcelBinOutput/ProudSkillExcelConfigData.json`).
- The game data, `~/Esposter/genshin-parity/text/ExcelBinOutput/AvatarSkillExcelConfigData.json`: skill 11082's `cdTime` 16, burst 11085's `cdTime` 15 and `costElemVal` 60, and the depot's skill ids 11081 (normal attack, group 10831), 11082 (group 10832) and 11085 (burst, group 10839).
- The cached wiki, `~/Esposter/cache/genshin-wiki/Category_Lan_Yan_Talents.json`: the charged attack's stamina of 50, the burst's 2U, the Skyfeather Evil-Subduing Charm's 309% and 774%, and the constellations and their gameplay notes.
- [Black Pheasant Strides on Water](https://genshin-impact.fandom.com/wiki/Black_Pheasant_Strides_on_Water) and [Lustrous Moonrise](https://genshin-impact.fandom.com/wiki/Lustrous_Moonrise), Genshin Impact Wiki: the poise of her strikes, charged attack, collision, plunges and burst.
