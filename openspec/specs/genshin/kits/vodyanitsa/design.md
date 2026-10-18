# Vodyanitsa

Vodyanitsa's kit is its record and one behaviour module, `createVodyanitsaKitBehaviour`, avatar 10000140. gcsim has no folder for Vodyanitsa at v2.47.2, so Vodyanitsa's record follows [the kits index](../README.md).

## Decisions

- **Vodyanitsa borrows Barbara's strikes and charged attack, Columbina's skill and Mona's burst, provisional.** Her four Hydro strikes take Barbara's four, each one hit, and her charged attack takes Barbara's single hit. Her skill takes Columbina's single Hydro hit, and her burst takes Mona's.
- **Her plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.** Her high plunge's impact is Hydro, as the wiki gives it, so that hit is Water; her low plunge is Physical. Her plunges' frames are read from her own clips.
- **Her skill scales with Max HP.** The wiki gives Rechitativ: Sonorous Dawn as 3.27% of Max HP at level 1, which is the talent multiplier of its proud group, so its hit reads `FIGHT_PROP_HP`.
- **Her frames are her clips' durations at 60 a second.** Her strikes read `Attack_01` to `Attack_04`, her charged attack `ExtraAttack`, her skill `ElementalArt_Strike`, her burst `ElementalBurst`, and her plunges `FallingAttack_Strike` and `FallingAttack_Strike_AS`.
- **Her strikes and charged attack are Hydro.**

## Not built

- **The Song of Ages Past effect is waiting on its module.** Her press starts it, and its Horn of Spring's Call and healing are not built, so her skill deals its press alone.
- **Her burst's Song of Ages Past bonus is not built.** Koda: Sink With Thee deals its hit alone.

## Key files

| File                                                                  | Role                                                                           |
| :-------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/vodyanitsaKit.ts` | `createVodyanitsaKitBehaviour`, with no behaviour of Vodyanitsa's own yet      |
| `packages/genshin-world/src/data/kits/vodyanitsa.json`                | Vodyanitsa's overlay: frames, hitmarks, areas, elements and the Max HP scaling |

## Sources

- [Vodyanitsa](https://genshin-impact.fandom.com/wiki/Vodyanitsa) and [Category:Vodyanitsa Talents](https://genshin-impact.fandom.com/wiki/Category:Vodyanitsa_Talents), Genshin Impact Wiki: her multipliers, energy, cooldowns and costs, Psyshkhwe Arietta's four strikes, Rechitativ: Sonorous Dawn's Max HP scaling and Koda: Sink With Thee.
- Vodyanitsa's clips, `Ani_Avatar_Girl_Catalyst_Vodyanitsa_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/barbara) at v2.47.2, MIT: Barbara's hitmarks and areas for Vodyanitsa's strikes and charged attack; [Columbina](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/columbina)'s for her skill; [Mona](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mona)'s for her burst; and [Bennett](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/bennett)'s for her plunges and collision.
