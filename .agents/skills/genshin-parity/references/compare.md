# Compare and the snapshot

Read when a screen's `compare` score is judged against its target, or its snapshot row is rewritten.

The one-line rule is in `SKILL.md`; this page is its reasoning.

`compare` writes every line it prints to stderr, and its stdout's last line is one JSON object per comparison: `id`, `score` (the mean difference, in percent), `bar`, and `worst`, the grid's `--cells` most-differing cells (default 10), each with its `cell` as column and row, its `error` and both images' mean colour. The grid is six by six over the compared region. A parity page that predates a build of `genshin-engine`, `genshin-interface` or `genshin-text` is replaced for the run by one of the run's own, served with `--force` on a free port and stopped at the run's end, so the page left running is untouched. Shots are kept in `{data-root}/genshin-parity/shots/<worktree name>`, one folder per checkout (`main` for the shared checkout; `SHOTS_DIRECTORY` in `scripts/src/services/genshinParity/shared/constants.ts`), so two checkouts never overwrite each other's shot, and `probe` reads our side from the same folder.

Target a mean of hundredths of a percent, with any remainder explained (antialiasing along an edge). The run rewrites its row of the committed `ParityReferenceMap.snapshot.md` and leaves every other row as it was (`--all` rewrites every row and drops the rows of references the map no longer holds), which is committed with the change that moved it and is the only score a session quotes.

A reference whose `plateSource` screenshot is not on disk, or whose plate is not the reference's size, fails its compare with the reason rather than scoring against the reference's own frame. `compare --all` prints that reference as `failed` and goes on.
