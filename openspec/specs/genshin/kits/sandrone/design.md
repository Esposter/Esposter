# Sandrone

Sandrone's kit is its record and one behaviour module, `createSandroneKitBehaviour`, avatar 10000133. gcsim has no folder for her at v2.47.2, so her record follows [the kits index](../README.md).

## Decisions

- **Her kit is named Sandrone, the dump's English name.** The kit's files take the kebab-cased English name, which the dump gives as Sandrone, and the avatar's icon and model keep the earlier name Marionette.- **Sandrone borrows Kinich's strikes, Aino's charged attack and skill, Chongyun's first three burst hits and Diluc's fourth, provisional.** Kinich's three claymore strikes take her three strikes, one hit each. Her charged attack takes Aino's single hit, and her Prism Shot takes Aino's two hits. Her burst's Bombardment takes Chongyun's three hits, and its Convective Inhibition Ray takes Diluc's single hit.
- **Her charged attack reads its "Charged Attack Sweeping Fire DMG" label and drains no stamina, provisional.** Her table names no "Charged Attack DMG" and no stamina cost, so her overlay names the Sweeping Fire label and a stamina of 0, as Lauma's does.
- **Her plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.** Her plunges' frames are read from her own clips.
- **Her frames are her clips' durations at 60 a second.** Her strikes read `Attack_01` to `Attack_03`, her charged attack `ExtraAttack_Start` and `ExtraAttack_Loop` together, her skill `ElementalArt_BS`, her burst `ElementalBurst`, and her plunges `FallingAttack_Strike` and `FallingAttack_Strike_AS`.
- **Her strikes and charged attack are Physical, and her skill and burst are Ice.**
- **Prism Shot's first hit keeps Aino's 16.2 metre area.** It is far wider than her other hits, and stays provisional until a source reads it.

## Not built

- **Power Overdrive is waiting on its record.** Her burst's Power Overdrive form and the hits it deals are not built.
- **Her Condensed Beam is not built.** Its charged attack label is not read, so her charged attack deals Sweeping Fire alone.
- **Her Stellar-Conduct and Stellar Swirl hits are not built.** Her Prism Shot's and Condensed Beam's Stellar hits, and the burst's Stellar hits, are not in her record.

## Key files

| File                                                                | Role                                                                  |
| :------------------------------------------------------------------ | :-------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/sandroneKit.ts` | `createSandroneKitBehaviour`, with no behaviour of Sandrone's own yet |
| `packages/genshin-world/src/data/kits/sandrone.json`                | Sandrone's overlay: frames, hitmarks, areas and the Ice elements      |

## Sources

- [Sandrone](https://genshin-impact.fandom.com/wiki/Sandrone) and [Category:Sandrone Talents](https://genshin-impact.fandom.com/wiki/Category:Sandrone_Talents), Genshin Impact Wiki: her multipliers, energy, cooldowns and costs, her three strikes, Prism Shot and the burst.
- Her clips, `Ani_Avatar_Girl_Claymore_MarionetteNew_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/kinich) at v2.47.2, MIT: Kinich's hitmarks and areas for her strikes; [Aino](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/aino)'s for her charged attack and Prism Shot; [Chongyun](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/chongyun)'s for Bombardment; [Diluc](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/diluc)'s for the Convective Inhibition Ray; and [Bennett](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/bennett)'s for her plunges and collision.
