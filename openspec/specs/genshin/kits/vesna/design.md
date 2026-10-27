# Vesna

Vesna's kit is its record and one behaviour module, `createVesnaKitBehaviour` (`packages/genshin-world/src/services/kit/characters/vesnaKit.ts`), avatar 10000143 (`{data-root}/genshin-parity/text/ExcelBinOutput/AvatarExcelConfigData.json`). Its `{data-root}/cache/gcsim-v2.47.2/internal/characters/` holds no `vesna` folder at that tag, so the record follows [the kits index](../README.md).

## Decisions

- **Vesna borrows Xingqiu's strikes (10000025), Jean's charged attack and skill (10000003), and Kazuha's burst (10000047), provisional.** Her first four strikes take Xingqiu's first four, her third strike's two hits matching his. Her fifth and sixth take the two hits of his fifth strike, since no sword donor has six strikes. Her charged attack and skill take Jean's, and her burst takes Kazuha's single hit.
- **Vesna's collision and plunges land on Bennett's hitmarks within his areas (`{data-root}/cache/gcsim-v2.47.2/internal/characters/bennett/plunge.go` lines 28, 33 and 170), each a `NoActionFile` stand-in.** Bennett's plunge file gives his low plunge's hitmark at 36, his high at 38 and his collision at 30 ([Nahida's kit](../nahida/design.md)). Her own clips time her plunges.
- **Her skill and burst are Anemo.** (`{data-root}/cache/genshin-wiki/Category_Vesna_Talents.json`, the infoboxes of The Art of Victory and For the Tsaritsa!) Her strikes and charged attack are Physical with no source yet (see Open). The Armed for Action form, which makes the strikes Anemo, is not built; the same cached pages, Vila Blade Dance and The Art of Victory, name the form.
- **Her frames are open until her clips are measured.** The record holds her animation frames as `Unsourced`: they are her clips' durations, which this pass's sources do not hold (the cached pages give no frames, and the installed clips are outside them). A value no source gives for a character gcsim has no folder for is `NoGcsimUnit` by the [kits README](../README.md#framework-decisions), so the overlay's `Unsourced` entries are wrong as they stand.
- **Her frames are her clips' durations, as the [kits index](../README.md) says (the clip durations are read by `scripts/src/services/genshinAssets/commands/timingsCommand.ts`).** Her six strikes read `Attack_01` to `Attack_06`, her charged attack ExtraAttack, her skill ElementalArt, her burst `ElementalBurst`, and her plunges FallingAttack_Strike and FallingAttack_Strike_AS (`{data-root}/genshin-parity/extracted/timings/10453615/AnimationClip/Ani_Avatar_Girl_Sword_Vesna_Attack_01.json` and its siblings, one per name).

## Not built

- **Armed for Action is waiting on its hooks.** Her armed strikes (ExtraAttack_AS) and the Anemo they deal are not built, so her strikes deal Physical damage in every state (no source yet, see Open).
- **Her burst's Stellar Swirl hit is not built.** The cached For the Tsaritsa! page (`{data-root}/cache/genshin-wiki/Category_Vesna_Talents.json`) gives a Spirit Blade Stellar Swirl DMG row beside the Spirit Blade DMG, and her burst deals its Spirit Blade hit alone.

## Key files

| File                                                             | Role                                                            |
| :--------------------------------------------------------------- | :-------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/vesnaKit.ts` | `createVesnaKitBehaviour`, with no behaviour of Vesna's own yet |
| `packages/genshin-world/src/data/kits/vesna.json`                | Vesna's overlay: frames, hitmarks, areas and the Anemo elements |

## Sources

- [Vesna](https://genshin-impact.fandom.com/wiki/Vesna) and [Category:Vesna Talents](https://genshin-impact.fandom.com/wiki/Category:Vesna_Talents), Genshin Impact Wiki: Vesna's multipliers, energy, cooldowns and costs, Vila Blade Dance's six strikes, and the Armed for Action form.
- Vesna's clips, `Ani_Avatar_Girl_Sword_Vesna_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xingqiu) at v2.47.2, MIT: Xingqiu's hitmarks and areas for Vesna's strikes; [Jean](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/jean)'s for her charged attack and skill; [Kazuha](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/kazuha)'s for her burst; and [Bennett](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/bennett)'s for her plunges and collision.

## Open

- [ ] **Her strikes and charged attack are Physical** — no source yet: the cached `{data-root}/cache/genshin-wiki/Category_Vesna_Talents.json` never says Physical and names no element for the strikes, and gcsim has no Vesna folder.
