# Lisa

Lisa's kit is its record and one behaviour module, `createLisaKitBehaviour`, on avatar 10000006: four strikes, a charged attack, a collision and two plunges, Violet Arc's press and its hold, released by itself at 4 seconds, and Lightning Rose's thirty discharges. Its multipliers are read from proud skill groups 431, 432 and 439, and match gcsim's to six decimal places and the wiki's Lightning Touch, Violet Arc and Lightning Rose values to two decimal places. Lightning Rose is a summon, built as the [shared effects](../README.md).

## Decisions

- **Lightning Rose's activation deals no damage.** The wiki gives it 0U and 10 poise and no multiplier, so the activation is a poise-only hit. gcsim gives it a multiplier of 0.1 that the table does not, so it is left out.
- **Violet Arc's press cooldown is the wiki's 1 second, and its hold's is the table's 16.** The hold plays on its release, as Passion Overload's Charge Levels do, once it has been held 1.9 seconds, the wiki's time to charge in full. That 1.9 is provisional, as no table gives the hold's minimum, and the roadmap's References sought list holds `lisa-violet-arc-hold.mkv` to measure it.
- **Conductive is a status that stacks on the enemy, and gcsim gives its stacks no duration.** Each press hit applies a stack, up to three, and Lisa's charged attacks apply one from A1, as [gcsim's ascension file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lisa/asc.go) gives them; her normal attacks do not apply it. Stacks are an `EnemyStatus` with `stacks` and `maxStacks`, which a stacking status adds to rather than restarts, and they never expire.
- **Violet Arc's hold reads the stacks on each enemy it strikes.** A `stackedHit` sets the hold's multiplier and poise for each enemy by its Conductive stacks, 320% to 487% and poise 150 to 300 from the wiki, and consumes the stacks. The hold reaches 10.2 metres, gcsim's 10 metres with each enemy's 0.2 circle.
- **Lightning Rose's Ascension 4 lowers the DEF of each enemy a discharge hits by 15% for 10 seconds.** The dump's Lisa passive text and gcsim's `lisa/asc.go` give the same values. The reduction is a status's `defenseReduction`, which the enemy's DEF takes off where a hit reads it. gcsim applies it after the hit that carries it, and the framework applies a hit's own status before pricing that hit, so the first discharge of a cast is priced with the reduction where gcsim's is not; the later discharges match, as the status refreshes on each one.
- **Violet Arc's hold is released by itself at 4 seconds.** A kit's `elementalSkillMaximumHeldSeconds` caps the seconds a skill is held at its maximum, and the skill is released there, once: the hold level its seconds reach at that moment starts, and holding on past it starts nothing again. The wiki's Violet Arc page gives the maximum of 4 seconds.

## Key files

| File                                                            | Role                                                                                                               |
| :-------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/lisaKit.ts` | `createLisaKitBehaviour`, Lisa's kit with Violet Arc's hold and Conductive stacks, and Lightning Rose's discharges |

## Sources

- [Lightning Touch](https://genshin-impact.fandom.com/wiki/Lightning_Touch), [Violet Arc](https://genshin-impact.fandom.com/wiki/Violet_Arc) and [Lightning Rose](https://genshin-impact.fandom.com/wiki/Lightning_Rose), Genshin Impact Wiki: Lisa's strikes', charged attack's and plunges' gauges and poise, Violet Arc's press gauge, poise and cooldown, and Lightning Rose's activation and discharge.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lisa), MIT: the kit's hitmarks, cancel frames and areas, Lightning Rose's discharges, and the values its talent file gives, which its multipliers match.
- [gcsim v2.47.2 skill file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lisa/skill.go), MIT: the Conductive stack each press applies, up to three.
- [gcsim v2.47.2 ascension file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lisa/asc.go), MIT: the Conductive stack a charged attack applies from Ascension 1.
- [gcsim v2.47.2 constellation file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lisa/cons.go), MIT: Constellation 1's Energy and Constellation 6's three Conductive stacks.
