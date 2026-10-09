---
title: Commissions
description: Proposal — the parts of the daily commissions still unbuilt: a scene task swapping its area's camp, a quest task finishing with its quest, the day kept between visits, the handbook's Commissions tab with its words, the other regions' pools, and the sources of Encounter Points. Mondstadt's daily tasks, their dealing, claims, Katheryne's bonus and Encounter Point claims are built, as the commissions page describes.
model: claude-haiku-5-5
---

# Commissions

The daily tasks, their dealing, their claims and Katheryne's bonus are built ([commissions](/docs/genshin/commissions)), on the four a day the [quests](/docs/proposals/genshin/quests) proposal deals and the [Adventure Rank](/docs/proposals/genshin/adventure-rank) that opens them. What remains is what a commission does in the world once it is dealt: the area it swaps, the quest it finishes with, the day the player keeps, and the handbook that shows the four.

## Decisions

- **The scene swap is the [commissions page](/docs/genshin/commissions)'s rule.** Its old groups stand aside for its new ones until it is done and the area reloads, so a commission replaces the enemies, objects and chests that stood there. The camps and objects a scene task swaps in stand where the [spawned places](/docs/proposals/genshin/spawned-places) fit them, around the task's own named point.
- **A commission is blocked where a quest stands.** A task whose place a quest in progress holds is never dealt. Dealing takes that set of places, and the set is read from the quests in progress once they are kept.
- **Each region's pool joins once its quest is done.** Only Mondstadt's pool is read so far, and each other region's joins when its daily tasks are read.
- **The handbook shows the day's four.** The Adventurer Handbook's Commissions tab lists them with the preferred region, as the game shows them, each title and description the game's own words by text id.
- **Kept with the player's progress**, and every unfinished one replaced at the daily reset, which the world reads from the game's day as the enemies' respawn does.
- **A quest task finishes with its quest.** Its quest's completion reaches the commission once the quests report it.
- **Encounter Points come from quests, chests and certain items.** Each of those pages gives them and the claim is built, so only the sources wait.

## Scope and order

**Built:** the daily tasks read for Mondstadt, dealt four a day from the reached areas, claimed for the reward of the rank each was dealt at, Katheryne's bonus on the day's fourth claim, and an Encounter Point's claim of an unfinished one ([commissions](/docs/genshin/commissions)).

**This adds, in order:**

1. **Scene tasks**, swapping their area's camp while open, once the area's groups are extracted.
2. **Quest tasks and the kept day**: a quest's completion reaching its commission, and the day kept through the daily reset.
3. **The handbook's Commissions tab** and the commissions' words.
4. **Routing and the other regions**: the claim's items to the wallet, the bag, the Adventure Rank and the [friendship grant](/docs/genshin/companionship), the other regions' pools, and the sources of Encounter Points.

## Data and measures

- **Read from the game's tables:** the scene points the tasks stand at, and the groups a scene task swaps, which the area's extraction holds once it is run.
- **Placed by the spawned places:** the camps and objects a scene task swaps in.
- **Read from the recordings:** the Adventure Treasure Pack that the wiki lists on Katheryne's bonus, which the dump's preview names at a count of zero, is settled by a clip of the bonus being claimed ([roadmap](/docs/genshin/roadmap)).

## Key files

| File                                                              | Role after the change                                    |
| :---------------------------------------------------------------- | :------------------------------------------------------- |
| `packages/genshin-world/src/models/enemy/EnemyCamp.ts`            | A scene task's camp, swapped in for its area's own       |
| `packages/genshin-world/src/services/quest/advanceQuest.ts`       | Advances a quest task's quest as any quest's is advanced |
| `packages/genshin-world/src/services/handbook/constants.ts`       | The Commissions tab, filled with the day's four          |
| `packages/genshin-world/src/components/Handbook/Screen/Index.vue` | Draws the day's commissions and the preferred region     |

## Sources

- [Commission](https://genshin-impact.fandom.com/wiki/Commission), Genshin Impact Wiki: the scene tasks replacing their area's enemies and objects, the quest blocking a commission's place, the preferred region, and Encounter Points.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the daily task table with each task's place, radius, finish and swapped groups, read by the built part.
