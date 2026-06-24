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

## DeleteRowsCommand

| task                                  | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ------------------------------------- | ------- | --------- | ------ | -------- | ------- | ------- |
| execute — delete 50 rows from 100     | 1.00×   | 0.0308    | ±0.71% | 0.0640   | 32458   | 16230   |
| execute — delete 500 rows from 1000   | 0.1×    | 0.3042    | ±1.38% | 0.7222   | 3287    | 1645    |
| execute — delete 5000 rows from 10000 | 0.0076× | 4.0314    | ±2.53% | 5.9687   | 248     | 125     |
| undo — re-insert 50 rows into 50      | 0.51×   | 0.0600    | ±0.72% | 0.1256   | 16659   | 8330    |
| undo — re-insert 500 rows into 500    | 0.053×  | 0.5783    | ±1.30% | 1.1723   | 1729    | 865     |
| undo — re-insert 5000 rows into 5000  | 0.004×  | 7.6457    | ±3.15% | 11.4888  | 131     | 66      |
