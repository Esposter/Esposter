# Fail CI on a wall-clock benchmark regression

Run the speed benchmark in CI and fail the build when a path is slower than the native baseline by some threshold.

## Why not

Wall-clock numbers on shared CI runners are noisy — neighbour load, throttling, and cold caches swing a ~140ms spawn by >20% (an early run flaked to 1.23× on pure measurement noise). A hard wall-clock gate would be flaky-red for the very reason it was first deferred: the signal-to-noise ratio doesn't support a pass/fail bar.

The need it was meant to cover is already met:

- **Speed regressions** — **CodSpeed simulation** (🏎️ Bench, every push) measures CPU/cache via simulation, so it is hardware-independent and stable enough to compare across commits; the committed colocated `*.bench.md` (`vs base` multipliers) is the offline diff gate. → [specs/benchmarking.md](../specs/benchmarking.md)
- **Correctness regressions** — the differential suite is plain Vitest (`*.differential.test.ts`), so it already hard-fails the build in the 🏗️ CI coverage shards. No separate bench-style gate needed. → [specs/correctness.md](../specs/correctness.md)

Mark the CodSpeed simulation check required in branch protection if a blocking signal is wanted — that is a GitHub repo setting, not a workflow change.
