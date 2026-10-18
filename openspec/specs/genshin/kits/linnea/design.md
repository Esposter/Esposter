# Linnea

Linnea's kit is its record and one behaviour module, `createLinneaKitBehaviour`, avatar 10000130. gcsim has no folder for Linnea at v2.47.2, so Linnea's record follows [the kits index](../README.md).

## Decisions

- **Linnea borrows Tighnari's hitmarks and areas, provisional.** Her strikes, charged shot and skill take Tighnari's, a bow user of her role.
- **Linnea has no charged-shot clip.** Her charged shot takes Tighnari's 94 frames, and costs no stamina, as her table gives none: both provisional.
- **Linnea's skill is three hits and a chain.** Its Lumi Pound-Pound Pummeler and Heavy Overdrive Hammer labels give its three hits. Lumi Million Ton Crush gives the follow-up of `skillChain`, the Ultimate form that repeated tapping after the skill reaches. The chain's window is provisional: the dump gives no window number, so it is a placeholder 1 second, Unsourced.
- **Her burst is a heal.** Its labels give the initial and continuous healing, each a DEF share and a flat amount, and the healing duration, so the burst deals no hit. The heal's tick interval is not in the dump.
- **The sweep's causes.** gcsim has no action file for Linnea, so every frame, area and hit count her strikes, charged shot, skill, burst and plunges take from a donor is `NoActionFile` in her overlay. Her own elements, multipliers, stamina and the burst's zero hits are `Unsourced`, as no source gives them.

## Not built

- **Lumi is not summoned yet.** Her record reads the Lumi duration as `parameters.lumiDuration` from the skill's table, but no behaviour summons Lumi.

## Key files

| File                                                              | Role                                                              |
| :---------------------------------------------------------------- | :---------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/linneaKit.ts` | `createLinneaKitBehaviour`, with no behaviour of Linnea's own yet |
| `packages/genshin-world/src/data/kits/linnea.json`                | Linnea's overlay                                                  |

## Sources

- [Linnea](https://genshin-impact.fandom.com/wiki/Linnea) and [Category:Linnea Talents](https://genshin-impact.fandom.com/wiki/Category:Linnea_Talents), Genshin Impact Wiki: Linnea's multipliers, energy, cooldowns and costs.
- Linnea's clips, `Ani_Avatar_Girl_Bow_Linnea_*`, read with `genshin:assets timings` from the installed game.
- The game's `ProudSkillExcelConfigData` rows for Linnea's skill and burst groups (13032, 13039): her multipliers, durations, healing, cooldowns and costs, which the record reads by default.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/tighnari), MIT at v2.47.2: Tighnari's hitmarks and areas and his charged shot's frames, which Linnea's strikes, charged shot and skill take.
