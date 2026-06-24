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

## CreateRowsCommand

| task                                   | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| -------------------------------------- | ------- | --------- | ------ | -------- | ------- | ------- |
| execute — insert 100 rows into 100     | 1.00×   | 0.0509    | ±0.77% | 0.1128   | 19665   | 9833    |
| execute — insert 100 rows into 1000    | 0.98×   | 0.0519    | ±0.77% | 0.1027   | 19277   | 9639    |
| execute — insert 1000 rows into 10000  | 0.098×  | 0.5180    | ±1.24% | 0.9705   | 1930    | 966     |
| execute — insert 10000 rows into 10000 | 0.0091× | 5.6021    | ±1.92% | 7.3167   | 179     | 90      |
| undo — remove 100 rows from 200        | 0.53×   | 0.0952    | ±0.77% | 0.2041   | 10503   | 5252    |
| undo — remove 1000 rows from 11000     | 0.046×  | 1.1041    | ±2.32% | 2.0693   | 906     | 453     |
| undo — remove 10000 rows from 20000    | 0.0048× | 10.6970   | ±2.79% | 14.0150  | 93      | 47      |
