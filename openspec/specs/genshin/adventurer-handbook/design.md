# Adventurer Handbook

The game's Adventurer Handbook tracks a player's progress: the experience chapters that reward Adventure Rank tasks, the day's commissions, the domains open, the enemies and where they spawn, the quests it recommends, and the party's elemental lineup. In the world it is F1's screen, opened through the screens' `ScreenKind.AdventurerHandbook`.

## How it works

`HandbookScreen` draws the book with its tabs down the left edge, top to bottom as the English client draws them: Experience, Commissions, Domains, Enemies, Guide and Embattle. Each tab is named with the game's own word for it. The book opens at Experience: the chapter's checks and its navigator across the head, the investigation panel on the left with its ring, its bar of one segment per investigation, its rewards and their claimed footer, and the chapter's commissions down the right, each with its title, its progress, its rewards and its tick. A reward is the interface's `ItemTile`, its rarity's tile with its count on the strip across its foot. The world keeps no investigations yet, so it opens the page empty, and the close button returns to the world.

## Parity

The book is scored whole-frame against `handbook-experience`, the wiki's screenshot of the English client's Experience tab at 3130 by 1730, with every box measured off it in its own pixels. It scores over the bar, and the rows, tiles and colours were measured off it to get there. What is left is the game's art, which cannot ship: the item icons on the reward tiles, the commission rows' avatars, the tabs' emblems, the ring's ornament, the quill and the cover's corners and page edges. After the art comes the face, Signika for the game's HYWenHei, set at the game's cap height and letter-spaced to its widths, and the current chapter's ornate check, not drawn yet. A commission title of two lines puts its progress pill 11.5 below the game's, since the game's pill falls only 18 for a second line.

## Key files

| File                                                                        | Role                                                        |
| :-------------------------------------------------------------------------- | :---------------------------------------------------------- |
| `packages/genshin-world/src/components/Handbook/Screen/Index.vue`           | The book, its tabs and its Experience page                  |
| `packages/genshin-world/src/services/handbook/constants.ts`                 | The tabs in the English client's order, and the rows' pitch |
| `packages/genshin-world/src/services/handbook/HandbookTabGameTextKeyMap.ts` | Each tab's name in the game's words                         |
| `packages/genshin-interface/src/components/ItemTile/Index.vue`              | A reward's tile, coloured by its rarity                     |

## Notes

- **The Experience page is measured; the other tabs' pages are not.** Its sizes, places and colours are read off the wiki's screenshot, which `ParityReferenceMap` names: the rows are cards 242 tall at a 249.5 pitch, the tiles take the rarity's colours, and the tabs' labels shrink to the tab as the game's do, by an estimate from the label's length that holds for the English client's six. The open tab's look, standing 17 further out with a green edge, is the interaction states' work and not drawn yet.
- **Each tab's pages come with their feature.** The commissions with the daily commissions, the domains and enemies with combat and the enemies' spawns, the guide with the quests it recommends, and the experience and embattle chapters with Adventure Rank and character ascension.

## Sources

- [Adventurer Handbook](https://genshin-impact.fandom.com/wiki/Adventurer_Handbook), Genshin Impact Wiki: the Experience, Commissions, Domains, Enemies, Guide and Embattle tabs and what each shows.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: F1 opens the Adventurer Handbook.

## Reference

- `handbook-open-close.mkv` — F1 pressed in the open world, the Adventurer Handbook opening over the blurred scene, a tab clicked and its hover in view, then F1 closing it, 30 seconds at most at 60 frames a second; the open and close timings and the blur behind the book are read off it. On the wiki and YouTube, none found (searched 2026-10-11).
