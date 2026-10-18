# Nefer

Nefer's kit is its record and one behaviour module, `createNeferKitBehaviour`, avatar 10000122. gcsim has no folder for Nefer at v2.47.2, so Nefer's record follows [the kits index](../README.md).

## Decisions

- **Nefer borrows Nahida's, Keqing's and Bennett's hitmarks and areas, provisional.** Her strikes, skill and charged attack take Nahida's, a catalyst user of her role, and her burst takes Keqing's. Her plunges and collision borrow Bennett's hitmarks and areas, as `NoActionFile`.
- **Nefer's skill reads its "Skill DMG" label for two hits, and her burst its "1-Hit DMG" and "2-Hit DMG" labels for four.**

## Not built

- **Her Phantasm Performance is waiting on its record.** Her Shadow Dance and its Phantasm Performance hits (the Nefer and Shades strikes, and their charges) have labels of their own that Nefer's record does not read yet, so her skill deals the two hits above and not the performance.

## Key files

| File                                                             | Role                                                            |
| :--------------------------------------------------------------- | :-------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/neferKit.ts` | `createNeferKitBehaviour`, with no behaviour of Nefer's own yet |
| `packages/genshin-world/src/data/kits/nefer.json`                | Nefer's overlay                                                 |

## Sources

- [Nefer](https://genshin-impact.fandom.com/wiki/Nefer) and [Category:Nefer Talents](https://genshin-impact.fandom.com/wiki/Category:Nefer_Talents), Genshin Impact Wiki: Nefer's multipliers, energy, cooldowns and costs.
- Nefer's clips, `Ani_Avatar_Lady_Catalyst_Nefer_*`, read with `genshin:assets timings` from the installed game.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/nahida), MIT at v2.47.2: Nahida's hitmarks and areas for Nefer's strikes and skill, and [Keqing](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/keqing)'s for her burst.
