# Gcg

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {gcg-duel-board} needs parity-page — **Gcg: the duel board over its whole frame.** `pnpm -C scripts genshin:parity compare gcg-duel-board`, then `pnpm -C scripts genshin:parity approve gcg-duel-board`. Reads `{data-root}/genshin-parity/references/gcg-duel-board.png` (from `{data-root}/genshin-parity/captures/gcg-yt-tvboQ_ZWO_I-400-410.mp4` at 7 seconds), and the screen's page. Writes the screen's image beside its component, and its row of `ParityReferenceMap.snapshot.md`. Bar: the default, as the screen records no bar ([compute bars](../README.md#bars)). — blocked: the recording is on disk (`{data-root}/genshin-parity/captures/gcg-yt-tvboQ_ZWO_I-400-410.mp4`), and the board's build scores over the bar too, in its `gcg-duel-board` row of `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`.

## Open

- [x] **Blocked: the recording is not on disk** — corrected: `{data-root}/genshin-parity/captures/gcg-yt-tvboQ_ZWO_I-400-410.mp4` is on disk (3.3 MB, checked with `ls`).
