# Vesna

Vesna's kit is its record and one behaviour module, `createVesnaKitBehaviour`, avatar 10000143. gcsim has no folder for Vesna at v2.47.2, so Vesna's record follows [the kits index](../README.md).

## Decisions

- **Vesna borrows Xingqiu's strikes, Jean's charged attack and skill, and Kazuha's burst, provisional.** Her first four strikes take Xingqiu's first four, her third strike's two hits matching his. Her fifth and sixth take the two hits of his fifth strike, since no sword donor has six strikes. Her charged attack and skill take Jean's, and her burst takes Kazuha's single hit.
- **Her plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.** Her plunges' frames are read from her own clips.
- **Her strikes and charged attack are Physical, and her skill and burst are Anemo.** The Armed for Action form, which makes the strikes Anemo, is not built.
- **Her frames are her clips' durations at 60 a second.** Her six strikes read `Attack_01` to `Attack_06`, her charged attack `ExtraAttack`, her skill `ElementalArt`, her burst `ElementalBurst`, and her plunges `FallingAttack_Strike` and `FallingAttack_Strike_AS`.

## Not built

- **Armed for Action is waiting on its hooks.** Her armed strikes (`ExtraAttack_AS`) and the Anemo they deal are not built, so her strikes deal Physical damage in every state.
- **Her burst's Stellar Swirl hit is not built.** Her burst deals its Spirit Blade hit alone.

## Key files

| File                                                             | Role                                                            |
| :--------------------------------------------------------------- | :-------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/vesnaKit.ts` | `createVesnaKitBehaviour`, with no behaviour of Vesna's own yet |
| `packages/genshin-world/src/data/kits/vesna.json`                | Vesna's overlay: frames, hitmarks, areas and the Anemo elements |

## Sources

- [Vesna](https://genshin-impact.fandom.com/wiki/Vesna) and [Category:Vesna Talents](https://genshin-impact.fandom.com/wiki/Category:Vesna_Talents), Genshin Impact Wiki: Vesna's multipliers, energy, cooldowns and costs, Vila Blade Dance's six strikes, and the Armed for Action form.
- Vesna's clips, `Ani_Avatar_Girl_Sword_Vesna_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xingqiu) at v2.47.2, MIT: Xingqiu's hitmarks and areas for Vesna's strikes; [Jean](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/jean)'s for her charged attack and skill; [Kazuha](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/kazuha)'s for her burst; and [Bennett](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/bennett)'s for her plunges and collision.
