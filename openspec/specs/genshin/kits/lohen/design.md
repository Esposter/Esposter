# Lohen

Lohen's kit is its record and one behaviour module, `createLohenKitBehaviour`, avatar 10000129. gcsim has no folder for Lohen at v2.47.2, so Lohen's record follows [the kits index](../README.md).

## Decisions

- **Lohen borrows Xiangling's hitmarks and areas, provisional.** His strikes, charged attack and burst all take hers, a polearm user of his role.
- **Lohen's burst reads its "Skill DMG" label for six hits.**
- **Lohen's skill is a named list of four hits.** Its Etched Into Bone and Soul label gives the list, each hit at the skill's ×4 multiplier, and the list's length is four. The skill's own hit count is a stopgap `0` by overlay, `Unsourced`, which the list replaces until the length derives after the Tables candidates. The Etched hits' area and hit frames are Unsourced, copied from his burst hit's area and frames, since no donor gives them. Their poise is `NoPoiseSource`, as neither gcsim nor the wiki gives one. Their element is Cryo as the wiki's talent text names it, but no candidate reads an element from the wiki, so the overlay holds it `Unsourced`.
- **Evilsbane Blade's 500% is a prose value.** It is on the named hit `hits.evilsbaneBlade`, Unsourced 5, as the only source is his summary text, not a talent table.
- **Will to Win's damage per point is read for the skill and the burst.** The skill's gives `parameters.etchedWillToWinDamagePerPoint` and the burst's gives `parameters.manifestJudgmentWillToWinDamagePerPoint`.
- **The sweep's causes.** gcsim has no action file for Lohen, so every frame, area and hit count his strikes, charged attack, plunges and burst take from a donor is `NoActionFile` in his overlay. His own elements, multipliers, the skill's animation and its zero hits are `Unsourced` stopgaps, as no source gives them yet.

## Not built

- **Masterstroke's infusion is not built.** The skill's duration is read as `parameters.masterstrokeDuration`, but no behaviour infuses his strikes yet.
- **Joy's and Will to Win's maxima are not recorded.** The dump gives no number for either, so no record field takes them.

## Key files

| File                                                             | Role                                                            |
| :--------------------------------------------------------------- | :-------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/lohenKit.ts` | `createLohenKitBehaviour`, with no behaviour of Lohen's own yet |
| `packages/genshin-world/src/data/kits/lohen.json`                | Lohen's overlay                                                 |

## Sources

- [Lohen](https://genshin-impact.fandom.com/wiki/Lohen) and [Category:Lohen Talents](https://genshin-impact.fandom.com/wiki/Category:Lohen_Talents), Genshin Impact Wiki: Lohen's multipliers, energy, cooldowns and costs.
- Lohen's clips, `Ani_Avatar_Boy_Pole_Lohen_*`, read with `genshin:assets timings` from the installed game.
- The game's `ProudSkillExcelConfigData` rows for Lohen's skill and burst groups (12932, 12939): his multipliers, durations, cooldowns, costs and Will to Win values.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiangling), MIT at v2.47.2: Xiangling's hitmarks and areas, which Lohen's strikes, charged attack and burst take.
