# Quest

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {quest-screen} needs parity-page — **Quest: the screen over its whole frame.** `pnpm -C scripts genshin:parity compare quest-screen`, then `pnpm -C scripts genshin:parity approve quest-screen`. Reads `{data-root}/genshin-parity/references/quest-screen.png` (the wiki's `File:Quest Screen.png`, its `wikiTitle` at `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts` line 1045), and the screen's page. Writes the screen's image beside its component, and its row of `ParityReferenceMap.snapshot.md`. Bar: the default, as the screen records no bar ([compute bars](../README.md#bars)). — blocked: the whole frame's score is its `quest-screen` row in `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`, and its sub-regions `quest-screen-header`, `-list` and `-details` are the rows beneath it. The entry's plate is the still's own pixels, in 24 regions (`QUEST_SCREEN_PLATE` in `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`: the list, the details column, the band, the rewards, the rules, both buttons, the scroll bar and the recording's UID), so `getCleanPlateRegions` (`scripts/src/services/genshinParity/reference/getCleanPlateRegions.ts`) returns them; the screen's own blur and wash layer is then applied to that plate, so the still's wash counts twice and the frame's bottom reads brighter than the still. The page draws the still as captured, with no blur or colour fit added (`packages/genshin-world/src/components/Quest/Screen/Layout.reference.ts` line 51), and the list's scroll is the still's, 65 units down, through the fixture's `listScroll` prop (`packages/genshin-world/src/components/Quest/Screen/Index.fixture.ts` line 30). The next round needs the world behind this still without the wash the layer adds to it, or a whole-frame reference the page can judge.

## Open

- [ ] **Quest: the journal's emblem is a solid disc** — the still shows a cream ring round a dark interior with a light star, which is a missing asset named in the roadmap's asset rows (`openspec/changes/genshin-roadmap/tasks.md`, the quest screen's journal emblem) and not a hand-drawn badge.
- [ ] **Quest: our title and description ink is heavier than the still's** — the parity page loads only Signika 600 (`packages/genshin-world/parity/main.ts`), about 20 to 50 percent more bright pixels than the game's face, so a weight change renders the same until the game's face is on the page. A shared page limit, not the screen's error: a second face is a change to `parity/main.ts`, which every screen loads.
