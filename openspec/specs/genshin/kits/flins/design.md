# Flins

Flins's kit is its record and one behaviour module, `createFlinsKitBehaviour`, on avatar 10000120: his five strikes, a charged attack, a plunge collision and two plunges, Manifest Flame's press, which starts the stance, and Cometh the Night's initial and final hits. His multipliers are read from proud skill groups 12031, 12032 and 12039, matching gcsim's to six decimal places. From the same groups come the charged attack's stamina, the burst's energy cost and the skill's cooldown. The burst's cooldown is the game's 20 seconds, from its skill table, not gcsim's 15, as the decisions below give.

## Decisions

- **Flins's strikes are physical, with no travel, and land on their hitmarks.** Each is queued by gcsim at its hitmark, so the hits land at 11, 11, 16, 20, 29 and 29 frames, with the fourth strike's two at 20 and 29 and the fifth's at 29, in animations of 31, 31, 45, 67 and 68 frames. The first two are boxes of 1.3 by 3.2 and 2 by 3.8 metres, and the rest circles of 2.8 metres, each offset as gcsim gives it.
- **His charged attack is a box of 4 by 6 metres on the body's near edge, at 28 frames in an animation of 60.** It is physical, and costs 25 stamina, read from the table's index after its multiplier as the other kits' charged attacks read theirs.
- **Manifest Flame's press plays no hit of its own, and starts the stance.** gcsim's Arcane Light deals no damage, so the press builds no hit, and the stance it starts lasts the 10 seconds the table gives. During the stance his strikes and charged attack are Electro, at the skill's multipliers, and the strikes keep their hitmarks and reaches. Swapping him out ends the stance, which gcsim's exit from the field deletes.
- **The stance keeps the kit's own press and burst, as Raiden's Musou Isshin does.** Northland Spearstorm, which the stance's skill would be, waits on the hook below, so the press stands in for it until then. Pressing it inside the stance restarts the stance, where gcsim fires Spearstorm, so that one press differs until Spearstorm is built.
- **Cometh the Night's initial hit lands at 93 frames, and its final at 164, in an animation of 130.** Both are circles of 7 metres round the body, Electro, the initial at gcsim's one unit of gauge and the final at the wiki's 0. gcsim queues the final 71 frames after the initial ("burstHitmarkFinal = 17 + 9 + 9 + 9 + 27", `burst.go:22` and `burst.go:88`), so it lands past the animation, as the framework allows. The record's 164 is gcsim's 93 plus its "burstHitmarkFinal" of 71, cited at the queue call on `burst.go:88`, which the reader reads with the block's delay. gcsim's `burst.go` queues the middle hits at 17, 26, 35 and 44 frames after the initial's 93.
- **The burst's cooldown is the game's 20 seconds, and gcsim's 15 is not taken.** The game's skill table gives Cometh the Night (id 11205) a cooldown of 20 seconds, where gcsim sets 15. The kit takes the table's value, as the other kits' cooldowns read it.
- **His plunges are provisional.** No gcsim plunge file exists for Flins, so his timing is Nahida's, which is Bennett's, on the shared plunge reach and his own table's multipliers, and his poise is the wiki's polearm row of its plunging attack table, the plunge of his Pocztowy Demonspear talent: 150 for the high plunge, 100 for the low and 25 for the collision. The question sits on the [roadmap](../../../../changes/genshin-roadmap/tasks.md).

- **Whispering Flame, from Ascension 4, is a passive bonus to his Elemental Mastery of 8% of his ATK, to at most 160.** It is read through the kit's passive hook from his ATK as it stands, and the bonus is flat, as the attribute total takes it.

## Not built

- **Northland Spearstorm waits on a stance's own skill cooldown.** Inside the stance, the skill is a box of 4 by 6 metres at 23 frames, Electro, on the table's skill multiplier at index 6. It has a cooldown of 6 seconds of its own, which a stance's action cannot hold yet, so the kit keeps the press in its place until the framework can give a stance's skill its own cooldown.
- **Thunderous Symphony waits on the Lunar-Charged hook.** For six seconds after Spearstorm, the burst is a Lunar-Charged hit and an extra one at moonsign level 2. Both hits are Lunar-Charged, which the kit does not price yet, so the burst stays Cometh the Night.
- **Cometh the Night's middle hits are built by moonsign.** Two land always, and two more at Ascendant Gleam, which gcsim reads when its initial hit lands; the kit's landing condition reads the level as each hit lands, and the team's composition does not change within the burst. Its middle hits are Lunar-Charged in gcsim, but the builder sources that reaction for the first middle hit alone, so the other hits' reaction waits on the reader's Gcsim candidate, read from gcsim's `AttackTagDirectLunarCharged` tag.
- **Constellation 1's Energy is built, and the rest of its effects wait.** Its shorter Spearstorm cooldown waits with Spearstorm. His Ascension 1 passive and Constellations 2 and 6 are not built: Constellation 2 reads Northland Spearstorm, and Constellation 6 the Lunar-Charged reactions' DMG.

## Key files

| File                                                               | Role                                                                                                                                                                      |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/flinsKit.ts`   | `createFlinsKitBehaviour`, Flins's strikes, charged attack, provisional plunges, Manifest Flame's press and stance, and Cometh the Night's initial, middle and final hits |
| `packages/genshin-world/src/services/kit/checkIsAscendantGleam.ts` | `checkIsAscendantGleam`, the Moonsign check the middle hits and Zibai's fourth strike share                                                                               |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/flins), MIT: each strike's hitmark, animation and reach, the charged attack's box, hitmark and animation, Manifest Flame's press and stance, and Cometh the Night's hitmarks, animation and circle, read from gcsim's `attack.go`, `charge.go`, `skill.go` and `burst.go`; `cons.go` and `asc.go` hold the mechanics still waiting on hooks.
- The proud skill groups' indices, read from gcsim's data file for the character, which lists each multiplier beside its group.
- [gcsim](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go), MIT: Bennett's plunge timings, which Flins takes for want of a plunge file of his own; the wiki gives the collision's poise.
- [Plunging Attack](https://genshin-impact.fandom.com/wiki/Plunging_Attack), Genshin Impact Wiki: the poise of his plunges and collision, from the "Most Polearm Characters" row of its plunging attack table: 25 mid-air, 100 low impact and 150 high impact.
- [Pocztowy Demonspear](https://genshin-impact.fandom.com/wiki/Pocztowy_Demonspear), Genshin Impact Wiki: his normal attack talent, whose plunge takes the row above.
- The game's skill table, `AvatarSkillExcelConfigData` in its Excel tables, for Cometh the Night's cooldown of 20 seconds (id 11205, `Skill_E_Flins_01`), which the kit takes in place of gcsim's 15.
