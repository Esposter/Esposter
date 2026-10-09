---
title: Offering systems
description: Proposal — the regions' offering systems on one rule. A sacred tree, a fountain or a shrine takes every offering item of its kind the bag holds at once, rises a level for each threshold reached and gives that level's reward once. The rule and the Frostbearing Tree's levels are built, on the Offering systems page; the tree's place in Dragonspine and each region's offerings are what is left.
model: claude-haiku-5-5
---

# Offering systems

Beside the Statues of The Seven, many areas keep an offering of their own: the Frostbearing Tree in Dragonspine, the Sacred Sakura on Narukami Island, the Lumenstone Adjuvant in the Chasm's mines, Vanarana's Tree of Dreams, the Amrita Pool, the Fountain of Lucine, the Votive Rainjade, Tona's Flame and the Throne of the Primal Fire in Natlan, the Temple of Space's Memory Core and Snezhnaya's Shadow Realm Analyzer. Each takes items found exploring its place and gives rewards for levels, as a statue does for Oculi. They are one rule over different items, so this page is that rule. The rule is built with the statues' levelling, on the [Offering systems](/docs/genshin/offering-systems) page.

## Decisions

- **Everything is offered at once.** Interacting with the offering takes every one of its offering items the bag holds, rather than one at a time as a statue takes Oculi.
- **Levels at thresholds, each with its reward.** The offering rises a level for each threshold its total offered passes, and gives each level's reward once: a level's items, its gadget's blueprints, its Primogems and whatever else the wiki lists for that offering. Each offering's thresholds and rewards are read from its level-up table in the game's dump, which is fetched from the community's AnimeGameData into that dump where it is missing, and from the wiki's page of it where no table holds them.
- **The first offer starts it.** Level 1 takes no items, so the first offer reaches it whatever the bag holds, and pays its reward once, as a statue's first resonance does. The [built page](/docs/genshin/offering-systems) says how the table settled it.
- **A surplus past the last level is held.** Items offered past an offering's last level are kept, as a statue's surplus Oculi are, and are not returned to the bag.
- **Its items are found exploring its place.** Each offering's items stand at the [spawned places](/docs/proposals/genshin/spawned-places) or come from its region's quests, as the wiki lists for each.
- **What a level unlocks is its region's.** A level that changes the place itself, such as a stronger Lumenstone Adjuvant, belongs to its region's page, which reads the offering's level.
- **One offering at a time, as its region is built.** Each is written with its region, on this rule.

## Scope and order

**Built:** the rule, `offerItems`, shared with the statues, and the Frostbearing Tree's levels, read from the game's table and written as their slice, on the [Offering systems](/docs/genshin/offering-systems) page.

**This still adds, in order:**

1. **The tree in Dragonspine**, Mondstadt's: its place in the world, F on it offering every offering item the bag holds, and the bag's removal of the items taken. Its items are placed by the spawned places, so the tree is wired with them.
2. **Each region's offerings**, with its region.

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
