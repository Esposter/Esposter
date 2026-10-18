# Kaeya

Kaeya's kit is its record and one behaviour module, `createKaeyaKitBehaviour`, on avatar 10000015: five strikes, a charged attack, a collision and two plunges, Frostgnaw with its A1 heal, and Glacial Waltz's thirteen icicles. Its multipliers are read from proud skill groups 1531, 1532 and 1539, and match the wiki's Ceremonial Bladework, Frostgnaw and Glacial Waltz values to two decimal places. Glacial Waltz's icicles are a summon, built as the [shared effects](../README.md).

## Decisions

- **Kaeya's groups are 1531, 1532 and 1539, not the talent table's 2531 and 2539.** The table names 2531 for his strikes and 2539 for his icicle, and their level-1 values, 46.6% for the first strike and 54.3% for the icicle, agree with neither the wiki nor gcsim. The 15xx groups carry the wiki's numbers, so the kit reads those; the stats run's choice of group for him is the thing to fix.
- **Frostgnaw's cooldown is the wiki's 6 seconds.** The skill table gives 21 seconds for his skill, which is not its cooldown; the proud skill group 1532 holds the 6, as gcsim's 360 frames do. Frostgnaw's damage against Water, its 4U gauge, is not built. A1's heal is built as a hit's `healAttackShare`: each enemy Frostgnaw strikes heals Kaeya by 15% of his ATK, read as the hit is priced.
- **Kaeya's reaches are priced with their offsets.** Its strikes, charge and plunges are priced a metre or so ahead of the body.

## Not built

- **Glacial Waltz's activation knockback is not built.** Its 400 poise has no damage and gcsim gives no area for it, so the icicles alone are built.

## Key files

| File                                                             | Role                                                                |
| :--------------------------------------------------------------- | :------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/kaeyaKit.ts` | `createKaeyaKitBehaviour`, Kaeya's kit with Glacial Waltz's icicles |

## Sources

- [Ceremonial Bladework](https://genshin-impact.fandom.com/wiki/Ceremonial_Bladework), [Frostgnaw](https://genshin-impact.fandom.com/wiki/Frostgnaw) and [Glacial Waltz](https://genshin-impact.fandom.com/wiki/Glacial_Waltz), Genshin Impact Wiki: Kaeya's strikes', charged attack's and plunges' poise, Frostgnaw's gauge and poise, and Glacial Waltz's icicle damage, gauge and poise.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/kaeya), MIT: the kit's hitmarks, cancel frames and areas, the icicles' ticks.
