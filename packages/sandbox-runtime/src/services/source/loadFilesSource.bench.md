# Benchmark results

Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff
Over time to catch regressions. `vs base` is a throughput multiplier against each group's baseline
(the `native` task, else the first): `1.00×` is the baseline, higher is faster, lower is slower — a
fast task drifting back toward `1.00×` is a regression. `±rme` is the relative margin of error.
Numbers are machine- and commit-dependent (see Environment); only compare runs from the same host.

## Environment

- Date: 2026-06-24T02:05:03.833Z
- Commit: ebb4afe18
- Node: v26.3.1
- OS: win32 10.0.26200 (x64)
- CPU: AMD Ryzen 7 7730U with Radeon Graphics × 16
- RAM: 38.8 GiB

## loadFilesSource — load + dispose by file count

| task       | vs base | mean (ms) | ±rme   | p99 (ms)  | ops/sec | samples |
| ---------- | ------- | --------- | ------ | --------- | ------- | ------- |
| files:1    | 1.00×   | 4.7933    | ±3.61% | 7.7286    | 209     | 105     |
| files:100  | 0.037×  | 128.7101  | ±7.16% | 141.8751  | 8       | 10      |
| files:1000 | 0.0035× | 1383.6751 | ±8.39% | 1798.9222 | 1       | 10      |
