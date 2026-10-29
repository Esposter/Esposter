# Quest

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {quest-screen} needs parity-page — **Quest: the screen over its whole frame.** `pnpm -C scripts genshin:parity compare quest-screen`, then `pnpm -C scripts genshin:parity approve quest-screen`. Reads `{data-root}/genshin-parity/references/quest-screen.png` (the wiki's `File:Quest Screen.png`), and the screen's page. Writes the screen's image beside its component, and its row of `ParityReferenceMap.snapshot.md`. Bar: the default, as the screen records no bar ([compute bars](../README.md#bars)). — blocked: the whole frame's score is its `quest-screen` row in `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`, no change from the diagnosis round. Its sub-regions, the three references `quest-screen-header`, `-list` and `-details`, are scored at their rows in `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`. The whole frame keeps its world blur and glass (`{data-root}/genshin-parity/references/quest-screen.png`), which the page draws no copy of (`packages/genshin-world/src/components/Quest/Screen/Layout.reference.ts`, "so the screen draws no scrim"). The list's scroll is the still's, 65 units down, through the fixture's `listScroll` prop. The whole-frame plate is untested: `getCleanPlatePath` refuses a whole-frame region and would fill the interface from its borders, which cannot recover the blurred world `scripts/src/services/genshinParity/reference/getCleanPlatePath.ts`. The next round needs a clean plate of the world behind this still, or a whole-frame reference the page can judge.

## Open

- [x] **Quest: the list sub-region's score is its `quest-screen-list` row** — the snapshot holds that row now, so the figures this item once quoted are no longer the record.
- [x] **Quest: the still's list sitting 65 lower than a list opened at its top** — `Layout.reference.ts` records the fixture's list opening 65 units down, as the still is scrolled.
- [ ] **The whole-frame reference is the wiki's `File:Quest Screen.png`** — no source yet: the wiki's `File:Quest Screen.png` page is not on disk.
