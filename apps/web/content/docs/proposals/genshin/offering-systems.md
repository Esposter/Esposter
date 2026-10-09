---
title: Offering systems
description: Proposal — the regions' offering systems on one rule. A sacred tree, a fountain or a shrine takes every offering item of its kind the bag holds at once, rises a level for each threshold reached and gives that level's reward once. The rule, the bag's offer, the Frostbearing Tree's levels and its place in Mondstadt are built, on the Offering systems page; the tree's items and name, its landmark and offer on F, and each region's offerings, are what is left.
model: claude-haiku-5-5
needs: [game-exports]
touches:
  [
    "scripts/src/services/genshinAssets/items/**",
    "packages/genshin-world/src/data/items/**",
    "packages/genshin-world/src/generated/nameText/**",
    "packages/genshin-text/src/**",
    "packages/genshin-persona/src/generated/**",
  ]
---

# Offering systems

Beside the Statues of The Seven, many areas keep an offering of their own: the Frostbearing Tree in Dragonspine, the Sacred Sakura on Narukami Island, the Lumenstone Adjuvant in the Chasm's mines, Vanarana's Tree of Dreams, the Amrita Pool, the Fountain of Lucine, the Votive Rainjade, Tona's Flame and the Throne of the Primal Fire in Natlan, the Temple of Space's Memory Core and Snezhnaya's Shadow Realm Analyzer. Each takes items found exploring its place and gives rewards for levels, as a statue does for Oculi. They are one rule over different items, so this page is that rule. The rule is built with the statues' levelling, on the [Offering systems](/docs/genshin/offering-systems) page.

## Decisions

- **Everything is offered at once.** Interacting with the offering takes every one of its offering items the bag holds, rather than one at a time as a statue takes Oculi.
- **Levels at thresholds, each with its reward.** The offering rises a level for each threshold its total offered passes, and gives each level's reward once: a level's items, its gadget's blueprints, its Primogems and whatever else the wiki lists for that offering. Each offering's thresholds and rewards are read from its level-up table in the game's dump, which is fetched from the community's AnimeGameData into that dump where it is missing, and from the wiki's page of it where no table holds them.
- **The first offer starts it.** Level 1 takes no items, so the first offer reaches it, and its reward is paid once, as [offering systems](/docs/genshin/offering-systems) settles.
- **A surplus past the last level is held.** Items offered past an offering's last level are kept, as [offering systems](/docs/genshin/offering-systems) records, and not returned to the bag.
- **Its items are found exploring its place.** Each offering's items stand at the [spawned places](/docs/proposals/genshin/spawned-places) or come from its region's quests, as the wiki lists for each.
- **What a level unlocks is its region's.** A level that changes the place itself, such as a stronger Lumenstone Adjuvant, belongs to its region's page, which reads the offering's level.
- **One offering at a time, as its region is built.** Each is written with its region, on this rule.
- **The tree's place is its own slice.** The Frostbearing Tree's place is written per region into `generated/frostbearingTreePlaces`, as the chests are, rather than into the region's landmark data, since the tree is not yet a landmark the world draws.
- **The tree's row is named, not verbed.** A prompt row shows its target's name beside its kind's icon, as the statues' rows do ([map unlocking](/docs/genshin/map-unlocking)), so the tree's row is `InteractionKind.Activate` named by `UI_ELDERTREE_MAINUI_TITLE` ("Frostbearing Tree"), and the game's "Offer" (`UI_BAG_OFFERING_JUMP`) is a button of the tree's own screen, not of the row. The row waits on no decoding.
- **Offering items are read by id.** An offering's offering items are the item ids its levels take, and the bag's count of each is offered together, so a tree whose levels take one item and an offering that takes several are one rule.

## Scope and order

**Built:** the rule, `offerItems`, shared with the statues; the bag's offer, `offerBagItems`, which takes the items out of the bag and pays the rewards in; the Frostbearing Tree's levels, read from the game's table; and its place in Mondstadt, written from the official map, on the [Offering systems](/docs/genshin/offering-systems) page.

**This still adds, in order:**

1. **The tree's items and name.** `scripts/src/services/genshinAssets/items/writeItems.ts` adds the item the tree's levels take and every item their rewards pay, read with `readFrostbearingTreeLevels` from `genshin-world` as it already reads the forge recipes, the wallet's ids left out as now. `pnpm -C scripts genshin:assets items` rewrites `packages/genshin-world/src/data/items/materials.json`, and `pnpm -C scripts genshin:text names` writes their names into the name chunks that already exist. `GameTextKey.FrostbearingTree` takes `UI_ELDERTREE_MAINUI_TITLE`, written with `pnpm -C scripts genshin:text write`. Test: `scripts/src/services/genshinAssets/items/writeItems.test.ts` gains a case asserting that every item the tree's levels take or pay, less the wallet's, is in the written materials.
2. **The tree in Dragonspine**, Mondstadt's: a stand-in drawn on the ground at its place in `generated/frostbearingTreePlaces/mondstadt.json`, an `Activate` row while it is in reach, F on it offering through `offerBagItems`, and its held count kept in the save.
3. **Each region's offerings**, with its region.

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
