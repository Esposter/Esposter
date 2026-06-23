# sandbox-runtime — Benchmarking

The speed gate. The whole project's value is "faster than doing it normally" — so every backend and speed feature must prove it against a native baseline, continuously. A path that loses to baseline is deleted.

## The rule

For each scenario, compare against **baseline = the same command run natively on the host** (warm OS cache, normal disk, normal network). A sandbox path ships only if:

- **Warm path** (snapshot/fork or shared store hit) is **meaningfully faster** than baseline.
- **Cold path** (first ever run, empty caches) is **no worse than baseline by more than a small, documented overhead** — the one-time cost is bought back by later warm runs.

If neither holds, the feature has negative value. Cut it.

## Scenarios

Run across a fixed corpus of real repos (small / medium / monorepo; with and without native deps):

- `install` — `pnpm install` cold, and warm (lockfile unchanged).
- `build` — typical build command.
- `test` — typical test command.
- `boot` — time to a ready sandbox.
- `fork` — time to clone a warm snapshot to a runnable state (the headline number).
- `repeated runs` — N sequential `test` runs (where warm-fork should dominate baseline).

## Cache states (measure each explicitly)

Cold (empty store + no snapshot) · warm store (deps present, no snapshot) · warm snapshot (post-install frozen). Never report a single number — report the matrix, and label which state.

## Metrics

Wall-clock (primary), plus peak RAM, disk written (should be ~0 for RAM FS), and network bytes (should be 0 on warm). Report median + p95 over ≥5 runs; pin CPU/RAM/OS of the bench host.

## Methodology

- Same host, same corpus, alternate sandbox vs baseline to cancel drift.
- Control the OS page cache between cold runs (drop caches) so "cold" is honest.
- Bench both backends; `vfs` and `os` have different cost profiles.
- Track results over time (regressions are bugs); wire a bench run into CI on the core packages.

## Constraints / Notes

- No silent wins: if a speedup only appears in an unrealistic state (e.g. everything pre-warmed by the bench itself), say so.
- The biggest expected win is **warm-fork repeated runs**; the riskiest number is **cold install overhead** — watch it closely.
