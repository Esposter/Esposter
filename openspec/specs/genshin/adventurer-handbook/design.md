# Adventurer Handbook

The game's Adventurer Handbook tracks a player's progress: the experience chapters that reward Adventure Rank tasks, the day's commissions, the domains open, the enemies and where they spawn, the quests it recommends, and the party's elemental lineup. In the world it is F1's screen, opened through the screens' `ScreenKind.AdventurerHandbook`.

## How it works

`HandbookScreen` draws the book with its tabs down the left edge, top to bottom as the English client draws them: Experience, Commissions, Domains, Enemies, Guide and Embattle `{data-root}/genshin-parity/references/handbook-experience.png`. Each tab is named with the game's own word for it `{data-root}/genshin-dump-backup-6.6/TextMap/TextMap_MediumEN.json`. The book opens at Experience: the chapter's checks and its navigator across the head, the investigation panel on the left with its ring, its bar of one segment per investigation, its rewards and their claimed footer, and the chapter's commissions down the right, each with its title, its progress, its rewards and its tick `{data-root}/genshin-parity/references/handbook-experience.png`. A reward is the interface's `ItemTile`, its rarity's tile with its count on the strip across its foot `{data-root}/genshin-parity/references/handbook-experience.png`. The world keeps no investigations yet, so the Experience page opens on an empty panel with no rewards and no commission rows, and the close button returns to the world.

## Parity

The book is scored whole-frame against `handbook-experience`, the wiki's screenshot of the English client's Experience tab at 3130 by 1730 `{data-root}/genshin-parity/references/handbook-experience.png`, with every box measured off it in its own pixels. It scores over the bar, and the rows, tiles and colours were measured off it to get there. What is left is the game's art, which cannot ship: the item icons on the reward tiles, the commission rows' avatars, the tabs' emblems, the ring's ornament, the quill and the cover's corners and page edges. After the art comes the face, Signika for the game's HYWenHei, set at the game's cap height and letter-spaced to its widths, and the current chapter's ornate check, not drawn. A commission title of two lines leaves its progress pill 7.5 low against the game's, which rises 22 for a second line.

## Key files

| File                                                                        | Role                                                        |
| :-------------------------------------------------------------------------- | :---------------------------------------------------------- |
| `packages/genshin-world/src/components/Handbook/Screen/Index.vue`           | The book, its tabs and its Experience page                  |
| `packages/genshin-world/src/services/handbook/constants.ts`                 | The tabs in the English client's order, and the rows' pitch |
| `packages/genshin-world/src/services/handbook/HandbookTabGameTextKeyMap.ts` | Each tab's name in the game's words                         |
| `packages/genshin-interface/src/components/ItemTile/Index.vue`              | A reward's tile, coloured by its rarity                     |

## Notes

- **The Experience page is measured; the other tabs' pages are not.** The rows are cards 242 tall at the pitch `COMMISSION_STEP` declares, and the tabs' labels shrink to the tab as the game's do, by an estimate from the label's length that holds for five of the English client's six, with Commissions set to 41 by hand. The Experience tab is drawn open at its full width with the game's green edge; the open look of another tab once clicked is the interaction states' work and not drawn.
- **Each tab's pages come with their feature.** The commissions with the daily commissions, the domains and enemies with combat and the enemies' spawns, the guide with the quests it recommends, and the experience and embattle chapters with Adventure Rank and character ascension.

## Sources

- [Adventurer Handbook](https://genshin-impact.fandom.com/wiki/Adventurer_Handbook), Genshin Impact Wiki: the Experience, Commissions, Domains, Enemies, Guide and Embattle tabs and what each shows.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: F1 opens the Adventurer Handbook.
- Requirement "Six tabs listed in the English client's order", scenario "Tabs read top to bottom": `{data-root}/genshin-parity/references/handbook-experience.png`
- Requirement "The Experience page shows the chapter and its commissions", scenario "Layout of the Experience page": `{data-root}/genshin-parity/references/handbook-experience.png`
- Requirement "The Experience page shows the chapter and its commissions", scenario "Reward tile takes its rarity's colours" (tile colours): `{data-root}/genshin-parity/references/handbook-experience.png`
- Requirement "The Experience page shows the chapter and its commissions", scenario "Reward tile takes its rarity's colours" (count on the strip): `{data-root}/genshin-parity/references/handbook-experience.png`
- Requirement "The Experience page shows the chapter and its commissions", scenario "Commission row shows its progress": `{data-root}/genshin-parity/references/handbook-experience.png`

## Reference

- `handbook-open-close.mkv` — F1 pressed in the open world, the Adventurer Handbook opening over the blurred scene, a tab clicked and its hover in view, then F1 closing it, 30 seconds at most at 60 frames a second; the open and close timings and the blur behind the book are read off it. On the wiki and YouTube, none found (searched 2026-10-11).

## Open

- [ ] **The handbook tracks the experience chapters, the day's commissions, the open domains, the enemies and their spawns, the recommended quests and the party's elemental lineup, and each tab's pages come with the feature named for it** — no source yet: the cached Adventurer Handbook wiki page is not on disk.
- [ ] **F1 opens the Adventurer Handbook in the game** — no source yet: the cached Controls wiki page is not on disk.
- [ ] **The open and close timings and the blur behind the book are read off the reference clip** — no source yet: `handbook-open-close.mkv` is not on disk.
