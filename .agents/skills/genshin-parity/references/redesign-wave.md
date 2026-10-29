# Redesigning screens in parallel

Read when several screens are redrawn from their references at once, each by an agent on a worktree and a parity page of its own, or when briefing one such agent. The tools are `toolbox.md`'s, the scoring is `compare.md`'s, the layout rules are `interface.md`'s; this page is the loop an agent follows and the limits it runs under.

## One agent, one worktree, one page

- **A worktree under `.agents/worktrees/<name>`** on a branch of its own, installed narrowly as the `throughput` skill's `references/fleet.md` says, then `pnpm exec vp run build:packages`. The agent reads, edits, runs and commits inside it and never edits the main checkout.
- **A parity page on a port of its own**, started from the worktree: `pnpm -C packages/genshin-world exec vite --config parity/vite.config.ts --port <port> --strictPort`, and every command carries `GENSHIN_PARITY_PORT=<port>`. Pages never share a port, so no agent's edits reach another's measure. The shot file is per checkout, under the parity directory's `shots/<worktree name>` (`shots/main` for the shared checkout), so two agents comparing the same screen from their own worktrees each write their own shot and never overwrite each other's.
- **A compare that measures an old build.** The page serves a pre-bundled copy of `genshin-interface` from `packages/genshin-world/node_modules/.vite`, and the compare reads the package's `dist`: after a pull that changed `genshin-interface`, rebuild it (`pnpm -C packages/genshin-interface build`); `compare` then measures a fresh page served with `--force` for the run, and says so on stderr, so the number is the new tree's.
- **A generated barrel that a `tsdown` build rewrites right after a pull** is a worktree whose `packages/configuration` build is stale, not a change: `pnpm -C packages/configuration build` once, then the package's build again, and the barrel comes out as committed. A rewritten barrel is never committed.

## The loop

1. `git pull --rebase origin ai/queue` first, with a clean tree.
2. Baseline every id of the screen with `compare`: the mean, the grid, the shape, the tone and FLIP, and the `reference | ours | difference` image, which is read. The snapshot rows can be stale, so the baseline is the number measured now.
3. Rebuild the markup and styles from the reference's own pixels (`measure`, `zoom`, `polar`, `trace`), delete what the screen does not need, and keep the fixture's props and variants working.
4. One change, then compare. A change is kept when the mean falls and the shape and FLIP do not worsen. One exception, for a screen with no image yet: a change that matches the reference's own pixels (a band, a panel, a colour measured) and lowers both the mean and FLIP is kept when it costs at most 0.02 of shape, because shape rewards the backdrop plate's own edges, which any such covering hides; the commit says so with the numbers.
5. Stop when every id is under 1% with the remainder explained (antialiasing, the game's typeface), after eight compares in a row that improve nothing, or after forty compares in all (more for a shared piece, whose set of ids is larger).
6. The tests of what was touched, once at the end. An image is written with `approve` after the last compare, whatever its score: the score is a report, and a screen above the bar is committed the same way.
7. Commit by explicit pathspec (the changed files and the snapshot rows the compares rewrote), `refactor(genshin-world): <screen> is redrawn from its reference screenshots`, the before and after per id in the body, and land it with `pnpm ai:land`. A conflict in the snapshot table keeps both sides' rows.

## What an agent may edit

- Its screen's world folder and the interface component only that screen mounts. A **shared piece** (`GameScreen`, `GameButton`, `GameRect`, `ItemTile`, `RoundButton`, `OrnamentDivider`, `ProgressBar` and any piece two screens mount) is its own pass, below; a screen that needs a change in one writes the need down with the measured values instead.
- Its screen's reference-map entries: `isBackdrop`, `plate` and `region` when the frame's scene cannot be drawn (the page draws the screen over the reference's own frame with the pieces filled from round them), and nothing else in the map.
- Words come only from `GameTextKey` keys. A word with no key is left undrawn and named for the machine that holds the game install, which adds the key and regenerates the text; a screen is never made to match a reference by typing a word.

## A screen with a reference and no fixture

Its first commit is the fixture, its reference-map entry (source, region, props or variant, and a comment saying what the frame shows and what is scored) and the removal of its row from `parity/pendingScreens.ts`, landed alone, with the manifest row `references pack` writes for its screenshot (`settled-directions.md`); the redraw is the next commit. The fixture holds an animated state still at the instant the frame shows.

## A shared piece

The protocol is to measure what a change does to every screen that mounts the piece. Find every mounting component, one hop out as well, and the ids whose entries name those screens (the guard set); baseline the whole set; change one thing at a time; compare the whole set after each change. A change is kept only when its target ids improve and no id in the set gets worse by more than 0.02 in mean, 0.01 in shape or 0.005 in FLIP; one that helps the target and hurts another becomes a prop with the old value as default, a local override on the screen that needs it, or nothing. A rule or prop the change leaves with no caller is deleted in the same commit, and so is a local override the shared fix made redundant.

## Limits

- **Memory binds before CPU.** Each agent with a page holds a headless browser and a dev server; on a 16 GB laptop four at once keep the load near the cores' count and the memory compressed. More pages than that slow every compare. Work that holds no page (review, docs, sweeps, benches, text and data) is not bound this way and runs beside them.
- **The machine with the game install takes what needs it:** the 3D scenes, the extracted layout and the text keys. It sources words and measures from the install, so a screen's words and numbers come from there and not through another machine's hands (`../../throughput/references/game-data.md`).
