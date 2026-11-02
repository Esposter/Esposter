# Quest

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {quest-screen} needs parity-page — **Quest: the screen over its whole frame.** `pnpm -C scripts genshin:parity compare quest-screen`, then `pnpm -C scripts genshin:parity approve quest-screen`. Reads `{data-root}/genshin-parity/references/quest-screen.png` (the wiki's `File:Quest Screen.png`, its `wikiTitle` at `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts` line 1045), and the screen's page. Writes the screen's image beside its component, and its row of `ParityReferenceMap.snapshot.md`. Bar: the default, as the screen records no bar ([compute bars](../README.md#bars)). — blocked: the whole frame's score is its `quest-screen` row in `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`, and its sub-regions `quest-screen-header`, `-list` and `-details` are the rows beneath it. The entry's plate is the overview clip's frame at 0.9 seconds, in six regions (`scripts/src/services/genshinParity/shared/ParityReferenceMap.ts` lines 21 to 28 and 1042 to 1043), so `getCleanPlateRegions` (`scripts/src/services/genshinParity/reference/getCleanPlateRegions.ts` lines 13 to 14) returns it rather than none; that plate draws no blur, so the still's blurred world is not recovered. The page draws the still as captured, with no blur or colour fit added (`packages/genshin-world/src/components/Quest/Screen/Layout.reference.ts` line 51), and the list's scroll is the still's, 65 units down, through the fixture's `listScroll` prop (`packages/genshin-world/src/components/Quest/Screen/Index.fixture.ts` line 30). The next round needs a clean plate of the world behind this still, or a whole-frame reference the page can judge.

## Open

- [ ] **Quest: `quest-screen-details` has no plate of the world behind its still** — its backdrop is the region itself, filled from the overview clip's border, about 60 levels darker than the still's world, so most grid cells of its first five rows score 10 to 31 whatever the column draws (13.80% mean, shape 0.946); a clean plate of that world cut from the recording would let the column's own error show.
- [ ] **Quest: the journal's emblem is a solid disc** — the still shows a cream ring round a dark interior with a light star, which is a traced asset to name in the roadmap's asset rows and not a hand-drawn badge.
- [ ] **Quest: our title and description ink is heavier than the still's** — the parity page loads only Signika 600 (`packages/genshin-world/parity/main.ts`), about 20 to 50 percent more bright pixels than the game's face, so a weight change renders the same until the game's face is on the page.
