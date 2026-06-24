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

## findDuplicateRows

| task                                 | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ------------------------------------ | ------- | --------- | ------ | -------- | ------- | ------- |
| First mode — 100 rows, 50 unique     | 1.00×   | 0.0466    | ±1.41% | 0.1172   | 21456   | 10728   |
| Last mode — 100 rows, 50 unique      | 1.13×   | 0.0412    | ±0.97% | 0.0921   | 24270   | 12135   |
| First mode — 1000 rows, 500 unique   | 0.11×   | 0.4356    | ±1.43% | 0.9165   | 2295    | 1148    |
| Last mode — 1000 rows, 500 unique    | 0.097×  | 0.4821    | ±1.43% | 1.0323   | 2074    | 1038    |
| First mode — 10000 rows, 5000 unique | 0.0073× | 6.4276    | ±3.33% | 9.2290   | 156     | 78      |
| Last mode — 10000 rows, 5000 unique  | 0.0063× | 7.3773    | ±3.58% | 11.0152  | 136     | 68      |
