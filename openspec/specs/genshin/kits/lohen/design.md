# Lohen

Lohen's kit is its record and one behaviour module, `createLohenKitBehaviour`, avatar 10000129 (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/AvatarExcelConfigData.json`). gcsim has no folder for Lohen at v2.47.2, so Lohen's record follows [the kits index](../README.md).

## Decisions

- **Lohen's record takes some of Xiangling's gcsim hitmarks and areas, and the rest has no matching donor.** His first two strikes (hitmarks 12 and 8, `attack.go` line 16), his charged attack's 24 frames (`charge.go` line 14) and the burst's first three hits (18, 33 and 57 frames, radii 2.5, 2.5 and 3, `burst.go` lines 16 and 17) match Xiangling's. His third to fifth strikes do not: Xiangling's third has two hits to his three, her fourth four to his one, and her fifth one to his two (`attack.go` line 16). His charged attack's second hit and the burst's last three hits have no matching donor. The hit counts follow the wiki's rows (`Category_Lohen_Talents.json`, `hit3_1 × 3`, `hit5_1` as two, `charged_1 × 2`), not Xiangling's. See Provisional constants.
- **Lohen's burst has six hits, which the record marks `Unsourced`** (`burst.hits.length`); the cached wiki's Skill DMG rows A to E and F, both on the Elemental Burst, give six (`~/Esposter/cache/genshin-wiki/Category_Lohen_Talents.json`).
- **Lohen's skill is a named list of four hits.** Its Etched Into Bone and Soul label gives the list, each hit at the skill's ×4 multiplier, and the list's length is four. The skill's own hit count is a stopgap `0` by overlay, `Unsourced`, which the list replaces until the length derives after the Tables candidates. The Etched hits' area and hit frames are Unsourced, copied from his burst hit's area and frames, since no donor gives them. Their poise is the wiki's 35 (`Category_Lohen_Talents.json`, Unforeseen Strike, poises 14 and 15). Their element is Cryo as the wiki's talent text names it, but no candidate reads an element from the wiki, so the overlay holds it `Unsourced`.
- **Evilsbane Blade's 500% is a prose value.** It is on the named hit `hits.evilsbaneBlade`, Unsourced 5. The cached wiki dump has no Evilsbane Blade text, so nothing in the cache gives the 500% (see Provisional constants).
- **Will to Win's damage per point is not read yet.** The design once named `parameters.etchedWillToWinDamagePerPoint` and `parameters.manifestJudgmentWillToWinDamagePerPoint`, but `lohen.json` has no `parameters` keys. The game's groups carry the values (group 12939's index 1 is 0.004, and group 12932 has a 10 at index 7), so each read waits on a record field.
- **The sweep's causes.** gcsim has no action file for Lohen, so every frame, area and hit count his strikes, charged attack, plunges and burst take from a donor is `NoActionFile` in his overlay. His own elements, multipliers, the skill's animation and its zero hits are `Unsourced` stopgaps, as no source gives them yet.

## Provisional constants

- **Hitmarks for his third to fifth strikes, his charged attack's second hit and his burst's last three hits have no matching donor.** Xiangling's gcsim hit counts and hitmarks for those do not match, and the record names no donor for them (`lohen.json`, `NoActionFile`).
- **The skill's animation (20 frames) and its Etched hits' element and hitmarks are `Unsourced`.** The Etched hits' hitmark of 18 and radius of 2.5 are copied from his burst's first hit.
- **Evilsbane Blade's 500% is unsourced in the cache.** `hits.evilsbaneBlade.multiplier` is 5, `Unsourced`.
- **Will to Win's and Masterstroke's parameters are not in the record.** Their values are in the game's groups, and no record field reads them yet.

## Not built

- **Masterstroke's infusion is not built.** No record field reads its duration, and no behaviour infuses his strikes yet.
- **Joy's and Will to Win's maxima are not recorded.** The dump gives no number for either, so no record field takes them.

## Key files

| File                                                             | Role                                                            |
| :--------------------------------------------------------------- | :-------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/lohenKit.ts` | `createLohenKitBehaviour`, with no behaviour of Lohen's own yet |
| `packages/genshin-world/src/data/kits/lohen.json`                | Lohen's overlay                                                 |

## Sources

- [Lohen](https://genshin-impact.fandom.com/wiki/Lohen) and [Category:Lohen Talents](https://genshin-impact.fandom.com/wiki/Category:Lohen_Talents), Genshin Impact Wiki: Lohen's multipliers, energy, cooldowns and costs.
- Lohen's clips, `Ani_Avatar_Boy_Pole_Lohen_*`, read per the [kits README](../README.md#sources).
- The game's `ProudSkillExcelConfigData` rows for Lohen's skill and burst groups (12932, 12939): his multipliers, durations, cooldowns, costs and Will to Win values.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiangling), MIT at v2.47.2: Xiangling's hitmarks and areas, which the first two strikes, the charged attack's first hit and the burst's first three hits match (see Decisions).
- The cached wiki, `~/Esposter/cache/genshin-wiki/Category_Lohen_Talents.json`: the strikes' hit counts and multipliers, the charged attack's two hits, the Unforeseen Strike's 18-second cooldown and 35 poise.

## Open

- [ ] **Lohen's skill is a named list of four hits** — no source yet: the cached wiki's Etched rows run hit1 to hit5, with hit3 three times and hit5 in two parts.
- [ ] **Evilsbane Blade's 500%** — no source yet: neither the cached wiki nor the dump's English text map holds Evilsbane Blade text.
- [ ] **The skill's 20-frame animation** — no source yet: gcsim has no Lohen folder, and the cached wiki's Lohen rows give no animation frames.
