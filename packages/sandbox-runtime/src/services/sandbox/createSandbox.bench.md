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

## createSandbox exec vs native baseline

| task    | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ------- | ------- | --------- | ------ | -------- | ------- | ------- |
| native  | 1.00×   | 176.8523  | ±8.32% | 209.8279 | 6       | 10      |
| sandbox | 0.99×   | 179.1567  | ±5.71% | 202.2113 | 6       | 10      |
