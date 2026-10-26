# Alyosha

Alyosha's kit is its record and one behaviour module, `createAlyoshaKitBehaviour`, avatar 10000148. gcsim has no folder for Alyosha at v2.47.2, so Alyosha's record follows [the kits index](../README.md).

## Decisions

- **Alyosha borrows Candace's strikes and charged attack, provisional, and her tap has no donor.** Candace's four strikes have the shape of Alyosha's, one, one, two and one hits (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/candace/attack.go:16`), and Alyosha's own wiki rows have the same shape, her first, second and fourth strikes one value each and her third two (`hit3_1=34.23+31.82`, `~/Esposter/cache/genshin-wiki/Category_Alyosha_Talents.json`), so her strikes take them whole, as the record's `BorrowedFromDonor` causes say. Her charged attack takes Candace's single hit (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/candace/charge.go`, one `QueueAttack` at line 42), and her wiki's charged row is one value (`charged_1=111.03`). Thunderbolt Strike's tap is not Candace's: its values carry the `NoGcsimUnit` cause, so its frames and area are the record's own, provisional.
- **Alyosha's plunges take Bennett's hitmarks, and their areas and collision are the record's own, cited `NoActionFile`.** Her low and high plunges strike at 36 and 38 frames, as Bennett's do (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/bennett/plunge.go:21` and `:22`), but her areas are 4 and 6 metres where Bennett's are 3 and 5 (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/bennett/plunge.go:28` and `:33`), so the areas are not Bennett's, and the record gives them the cause `NoActionFile`. The plunges' frames are open, as the last entry under Open says.
- **Her burst has no hit yet, as `NamedHitList`.** Hunter's Advance's field and Tugarin hits are spawned by her module by name, and that module is not built, so the burst's hits list is empty until it is (the record's `burst.hits.length`, `NamedHitList` at 0).
- **Her frames are read from her clips, as the [kits README](../README.md) states.** Her strikes read `Attack_01` to `Attack_04`, her charged attack ExtraAttack, her tap ElementalArt_NoCharge_Attack, her burst `ElementalBurst`, and her plunges FallingAttack_Strike and FallingAttack_Strike_AS.
- **Her strikes and charged attack are Physical, and her tap is Electro.** Candace's charged attack is Physical (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/candace/charge.go:35`), and the wiki's Thunderbolt Strike page gives its tap as Electro DMG (`~/Esposter/cache/genshin-wiki/Category_Alyosha_Talents.json`, the Tapping text, "AoE Electro DMG"), which the record's `Electric` names.

## Not built

- **Hunter's Advance is waiting on its module.** Its field and Tugarin hits are not spawned, so her burst deals no damage yet.
- **Thunderbolt Strike's hold is not built.** Her skill's hold has no record, so the skill deals its tap alone.
- **The clip frames are open.** Her animation and hitmark frames are read from the installed game's clips, which are on disk under `~/Esposter/genshin-parity/extracted/timings/`, but the plunge clips hold no animation events, so the values stand unchecked against them.

## Key files

| File                                                               | Role                                                                |
| :----------------------------------------------------------------- | :------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/alyoshaKit.ts` | `createAlyoshaKitBehaviour`, with no behaviour of Alyosha's own yet |
| `packages/genshin-world/src/data/kits/alyosha.json`                | Alyosha's overlay: frames, hitmarks, areas and the Electro tap      |

## Sources

- [Alyosha](https://genshin-impact.fandom.com/wiki/Alyosha) and [Category:Alyosha Talents](https://genshin-impact.fandom.com/wiki/Category:Alyosha_Talents), Genshin Impact Wiki: Alyosha's multipliers, energy, cooldowns and costs, Skirmishing Spear's four strikes, Thunderbolt Strike and Hunter's Advance.
- Alyosha's clips, `Ani_Avatar_Boy_Pole_Alyosha_*`, read with `genshin:assets timings` from the installed game.
- The wiki page cached at `~/Esposter.noindex/cache/genshin-wiki/Category_Alyosha_Talents.json`, its Thunderbolt Strike row (15 seconds, Electro DMG), and the dump's skill `11482`, whose `cdTime` is 15.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/candace) at v2.47.2, MIT: Candace's hitmarks and areas for Alyosha's strikes, charged attack and tap; and [Bennett](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/bennett)'s for her plunges and collision.

## Open

- [ ] **Her strikes and charged attack are Physical** — no source yet: the wiki's Skirmishing Spear and Charged Attack rows name no element, and the dump's skill rows for her strikes are not read here.
- [ ] **Her low and high plunges strike at 36 and 38 frames, with areas of 4 and 6 metres** — no source yet: the wiki gives her plunges' damage and poise but no frames or areas, and her two plunge clips (`~/Esposter/genshin-parity/extracted/timings/06537046/AnimationClip/Ani_Avatar_Boy_Pole_Alyosha_FallingAttack_Strike.json` and `~/Esposter/genshin-parity/extracted/timings/02050112/AnimationClip/Ani_Avatar_Boy_Pole_Alyosha_FallingAttack_Strike_AS.json`) hold no animation events.
- [ ] **The frames of her strikes, charged attack, tap and plunges come from her own clips** — no source yet: her clips are on disk under `~/Esposter/genshin-parity/extracted/timings/`, but the two plunge clips hold no animation events, so no hitmark frame is read from them here.
