---
title: Adventurer Handbook
description: Genshin's Adventurer Handbook as built — F1's screen, an open book with the game's six tabs down its left edge in the English client's order, each named in the game's own words, its pages waiting on the features they track.
---

# Adventurer Handbook

The game's Adventurer Handbook tracks a player's progress: the experience chapters that reward Adventure Rank tasks, the day's commissions, the domains open, the enemies and where they spawn, the quests it recommends, and the party's elemental lineup. In the world it is F1's screen, opened through the screens' `ScreenKind.AdventurerHandbook`, and for now it is a placeholder.

## How it works

`HandbookScreen` draws the book with its tabs down the left edge, top to bottom as the English client draws them: Experience, Commissions, Domains, Enemies, Guide and Embattle. Each tab is named with the game's own word for it. The book opens at Experience, and choosing a tab opens its pages. The pages are empty, since each tab tracks a feature the world does not have yet, and the close button returns to the world.

## Key files

| File                                                                        | Role                                   |
| :-------------------------------------------------------------------------- | :------------------------------------- |
| `packages/genshin-world/src/components/Handbook/Screen/Index.vue`           | The book, its tabs and its empty pages |
| `packages/genshin-world/src/services/handbook/constants.ts`                 | The tabs in the English client's order |
| `packages/genshin-world/src/services/handbook/HandbookTabGameTextKeyMap.ts` | Each tab's name in the game's words    |

## Notes

- **The book's look is provisional.** Its sizes, places and colours wait on the parity pass against the wiki's screenshot of the English client's Experience tab, which `ParityReferenceMap` names.
- **Each tab's pages come with their feature.** The commissions with the daily commissions, the domains and enemies with combat and the enemies' spawns, the guide with the quests it recommends, and the experience and embattle chapters with Adventure Rank and character ascension.

## Sources

- [Adventurer Handbook](https://genshin-impact.fandom.com/wiki/Adventurer_Handbook), Genshin Impact Wiki: the Experience, Commissions, Domains, Enemies, Guide and Embattle tabs and what each shows.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: F1 opens the Adventurer Handbook.
