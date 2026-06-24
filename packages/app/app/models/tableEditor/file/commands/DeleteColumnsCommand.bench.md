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

## DeleteColumnsCommand

| task                                        | vs base  | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ------------------------------------------- | -------- | --------- | ------ | -------- | ------- | ------- |
| execute — delete 1 of 5 columns, 100 rows   | 1.00×    | 0.0068    | ±0.68% | 0.0155   | 147371  | 73686   |
| execute — delete 1 of 5 columns, 1000 rows  | 0.14×    | 0.0496    | ±0.72% | 0.1039   | 20144   | 10072   |
| execute — delete 1 of 5 columns, 10000 rows | 0.005×   | 1.3644    | ±6.00% | 4.5252   | 733     | 367     |
| execute — delete 3 of 5 columns, 1000 rows  | 0.056×   | 0.1210    | ±0.71% | 0.2348   | 8266    | 4134    |
| execute — delete 3 of 5 columns, 10000 rows | 0.0015×  | 4.4732    | ±8.35% | 9.6477   | 224     | 113     |
| undo — restore 1 column into 1000 rows      | 0.01×    | 0.6558    | ±1.37% | 1.2790   | 1525    | 763     |
| undo — restore 3 columns into 10000 rows    | 0.00072× | 9.4846    | ±3.25% | 13.7332  | 105     | 53      |
