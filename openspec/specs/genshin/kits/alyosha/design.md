# Alyosha

Alyosha's kit is its record and one behaviour module, `createAlyoshaKitBehaviour`, avatar 10000148. gcsim has no folder for Alyosha at v2.47.2, so Alyosha's record follows [the kits index](../README.md).

## Decisions

- **Alyosha borrows Candace's strikes, charged attack and skill, provisional.** Candace's four strikes have the shape of Alyosha's, one, one, two and one hits, so her strikes take them whole. Her charged attack and Thunderbolt Strike's tap take Candace's single hits.
- **Her plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.** Her plunges' frames are read from her own clips.
- **Her burst has no hit yet, as `NamedHitList`.** Hunter's Advance's field and Tugarin hits are spawned by her module by name, and that module is not built, so the burst's hits list is empty until it is.
- **Her frames are her clips' durations at 60 a second.** Her strikes read `Attack_01` to `Attack_04`, her charged attack `ExtraAttack`, her tap `ElementalArt_NoCharge_Attack`, her burst `ElementalBurst`, and her plunges `FallingAttack_Strike` and `FallingAttack_Strike_AS`.
- **Her strikes and charged attack are Physical, and her tap is Electro.**

## Not built

- **Hunter's Advance is waiting on its module.** Its field and Tugarin hits are not spawned, so her burst deals no damage yet.
- **Thunderbolt Strike's hold is not built.** Her skill's hold has no record, so the skill deals its tap alone.

## Key files

| File                                                               | Role                                                                |
| :----------------------------------------------------------------- | :------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/alyoshaKit.ts` | `createAlyoshaKitBehaviour`, with no behaviour of Alyosha's own yet |
| `packages/genshin-world/src/data/kits/alyosha.json`                | Alyosha's overlay: frames, hitmarks, areas and the Electro tap      |

## Sources

- [Alyosha](https://genshin-impact.fandom.com/wiki/Alyosha) and [Category:Alyosha Talents](https://genshin-impact.fandom.com/wiki/Category:Alyosha_Talents), Genshin Impact Wiki: Alyosha's multipliers, energy, cooldowns and costs, Skirmishing Spear's four strikes, Thunderbolt Strike and Hunter's Advance.
- Alyosha's clips, `Ani_Avatar_Boy_Pole_Alyosha_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/candace) at v2.47.2, MIT: Candace's hitmarks and areas for Alyosha's strikes, charged attack and tap; and [Bennett](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/bennett)'s for her plunges and collision.
