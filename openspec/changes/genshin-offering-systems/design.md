# Offering systems

Beside the Statues of The Seven, many areas keep an offering of their own: the Frostbearing Tree in Dragonspine, the Sacred Sakura on Narukami Island, the Lumenstone Adjuvant in the Chasm's mines, Vanarana's Tree of Dreams, the Amrita Pool, the Fountain of Lucine, the Votive Rainjade, Tona's Flame and the Throne of the Primal Fire in Natlan, the Temple of Space's Memory Core and Snezhnaya's Shadow Realm Analyzer. Each takes items found exploring its place and gives rewards for levels, as a statue does for Oculi. They are one rule over different items. The [offering systems](../../specs/genshin/offering-systems/design.md) page holds the rule and the Frostbearing Tree built on it.

## Decisions

- **Its items are found exploring its place.** Each offering's items stand at the [spawned places](../genshin-spawned-places/design.md) or come from its region's quests, as the wiki lists for each.
- **What a level unlocks is its region's.** A level that changes the place itself, such as a stronger Lumenstone Adjuvant, belongs to its region's page, which reads the offering's level.
- **Every offering's levels and rewards now, its place with its region.** An offering's items, thresholds and rewards are table data on the Frostbearing Tree's rule and wait on nothing, so every offering is published at once. Where it stands is published per region beside `frostbearingTreePlaces`, from the official map's point for it, and where its items stand comes with the spawned places.
- **The tree's landmark waits on the world's drawing.** The Frostbearing Tree's place is published per region as the `frostbearingTreePlaces` dataset, as the chests are, rather than into the region's landmark data, since the tree is not yet a landmark the world draws.

## Scope and order

**This still adds:**

1. **Every offering's levels and rewards**, from its level-up table or its wiki page, on the one rule.
2. **Each offering's place**, from the official map's point, published per region as the Frostbearing Tree's is.

## Data and measures

- **Read from the game's tables and the wiki:** each offering's items, thresholds and rewards, from its level-up table where the dump holds one or the community's dump fetches it, and from the wiki's page where no table holds them.
- **Placed by the spawned places:** where each offering's items stand.

## Key files

| File                                                                           | Role after the change                     |
| :----------------------------------------------------------------------------- | :---------------------------------------- |
| `packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts` | Lists an offering in reach to offer to    |
| `packages/genshin-world/src/services/inventory/addInventoryItem.ts`            | The bag the offering items are taken from |
| `packages/genshin-world/src/models/world/LandmarkKind.ts`                      | Gains the offering                        |

## Sources

- [Offering System](https://genshin-impact.fandom.com/wiki/Offering_System), Genshin Impact Wiki: each region's offerings, every item offered at once unlike a statue, and each one's levels and rewards. Not reached when the Frostbearing Tree was built, so its wording is still to be checked.
