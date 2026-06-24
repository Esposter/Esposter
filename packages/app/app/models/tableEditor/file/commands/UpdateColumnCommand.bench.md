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

## UpdateColumnCommand

| task                          | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ----------------------------- | ------- | --------- | ------ | -------- | ------- | ------- |
| execute (rename) — 100 rows   | 1.00×   | 0.0031    | ±0.98% | 0.0072   | 327657  | 163829  |
| execute (rename) — 1000 rows  | 0.26×   | 0.0119    | ±1.04% | 0.0348   | 84105   | 42053   |
| execute (rename) — 10000 rows | 0.026×  | 0.1188    | ±1.02% | 0.2230   | 8419    | 4210    |
| undo (rename) — 1000 rows     | 0.0055× | 0.5594    | ±1.07% | 1.0226   | 1788    | 894     |
| undo (rename) — 10000 rows    | 0.0005× | 6.0785    | ±2.47% | 9.2851   | 165     | 83      |
