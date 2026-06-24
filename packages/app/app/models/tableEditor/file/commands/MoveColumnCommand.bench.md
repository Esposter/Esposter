# Benchmark results

Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff
Over time to catch regressions. `vs base` is a throughput multiplier against each group's baseline
(the `native` task, else the first): `1.00×` is the baseline, higher is faster, lower is slower — a
fast task drifting back toward `1.00×` is a regression. `±rme` is the relative margin of error.
Numbers are machine- and commit-dependent (see Environment); only compare runs from the same host.

## Environment

- Date: 2026-06-24T02:07:14.209Z
- Commit: ebb4afe18
- Node: v26.3.1
- OS: win32 10.0.26200 (x64)
- CPU: AMD Ryzen 7 7730U with Radeon Graphics × 16
- RAM: 38.8 GiB

## MoveColumnCommand

| task                                      | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ----------------------------------------- | ------- | --------- | ------ | -------- | ------- | ------- |
| execute — move col 0→4, 100 rows          | 1.00×   | 0.0397    | ±0.91% | 0.1016   | 25184   | 12593   |
| execute — move col 0→4, 1000 rows         | 0.12×   | 0.3261    | ±1.93% | 0.8839   | 3067    | 1534    |
| execute — move col 0→4, 10000 rows        | 0.011×  | 3.4642    | ±3.26% | 5.7689   | 289     | 145     |
| undo — move col 0→4 then back, 1000 rows  | 0.07×   | 0.5687    | ±1.13% | 1.1470   | 1758    | 880     |
| undo — move col 0→4 then back, 10000 rows | 0.0057× | 7.0120    | ±4.95% | 11.8618  | 143     | 72      |
