# Quest

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {quest-screen} needs parity-page — **Quest: the screen over its whole frame.** `pnpm -C scripts genshin:parity compare quest-screen`, then `pnpm -C scripts genshin:parity approve quest-screen`. Reads `~/Esposter/genshin-parity/references/quest-screen.png` (the wiki's `File:Quest Screen.png`), and the screen's page. Writes the screen's image beside its component once approved, and its row of `ParityReferenceMap.snapshot.md`. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: whole frame measured FLIP 0.8054, mean 44.36% `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`, no change from the diagnosis round. Its sub-regions, the three references `quest-screen-header`, `-list` and `-details`, are baselines at FLIP 0.8306 (mean 41.97%) and 0.8746 (49.84%) `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`, the list's 0.586 (28.58%) having no snapshot row, with no build change yet. The whole frame keeps its world blur and glass (`~/Esposter/genshin-parity/references/quest-screen.png`), which the page draws no copy of (`packages/genshin-world/src/components/Quest/Screen/Layout.reference.ts`, "so the screen draws no scrim"). The list's scroll also differs: the still sits 65 lower than a list opening at its top. Still open: the fixture has no scroll hook, since `motionProps` sets props and not DOM scroll, so a scroll offset needs a component prop or a page hook; and `pnpm i` is blocked by an in-flight catalog edit (`lru-cache`), so the list's snapshot row is unwritten. The whole-frame plate is untested: `getCleanPlatePath` refuses a whole-frame region and would fill the interface from its borders, which cannot recover the blurred world `scripts/src/services/genshinParity/reference/getCleanPlatePath.ts`. The next round needs a clean plate of the world behind this still, or a whole-frame reference the page can judge.

## Open

- [ ] **Quest: the list sub-region at FLIP 0.586 and mean 28.58%** — no source yet: a `quest-screen-list` row in the parity snapshot, which holds only the header and details rows.
- [ ] **Quest: the still's list sitting 65 lower than a list opened at its top** — no source yet: a measured scroll offset of the list against the still, which no record holds.
- [ ] **The whole-frame reference is the wiki's `File:Quest Screen.png`** — no source yet: the wiki's `File:Quest Screen.png` page is not on disk.
