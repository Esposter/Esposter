# Benchmark results

Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff
Over time to catch regressions. `vs base` is a throughput multiplier against each group's baseline
(the `native` task, else the first): `1.00×` is the baseline, higher is faster, lower is slower — a
fast task drifting back toward `1.00×` is a regression. `±rme` is the relative margin of error.
Numbers are machine- and commit-dependent (see Environment); only compare runs from the same host.

## Environment

- Date: 2026-06-24T01:36:03.696Z
- Commit: 6b6a5a030
- Node: v26.3.1
- OS: win32 10.0.26200 (x64)
- CPU: AMD Ryzen 7 7730U with Radeon Graphics × 16
- RAM: 38.8 GiB

## src/services/exec/createVfsBackend.bench.ts > createVfsBackend — in-process node -e vs native spawn (hot path)

| task   | vs base  | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ------ | -------- | --------- | ------ | -------- | ------- | ------- |
| native | 1.00×    | 161.6645  | ±8.39% | 190.8840 | 6       | 10      |
| vfs    | 8949.20× | 0.0181    | ±2.52% | 0.0540   | 55357   | 27679   |

## src/services/exec/createVfsBackend.bench.ts > createVfsBackend — fall-back command vs native (no added overhead)

| task   | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ------ | ------- | --------- | ------ | -------- | ------- | ------- |
| native | 1.00×   | 124.8653  | ±3.22% | 137.1067 | 8       | 10      |
| vfs    | 0.96×   | 130.2201  | ±3.50% | 144.3633 | 8       | 10      |

## src/services/sandbox/createSandbox.bench.ts > createSandbox exec vs native baseline

| task    | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ------- | ------- | --------- | ------ | -------- | ------- | ------- |
| native  | 1.00×   | 141.6240  | ±5.03% | 152.9065 | 7       | 10      |
| sandbox | 1.01×   | 140.2890  | ±5.91% | 164.1128 | 7       | 10      |

## src/services/source/loadFilesSource.bench.ts > loadFilesSource — load + dispose by file count

| task       | vs base | mean (ms) | ±rme   | p99 (ms)  | ops/sec | samples |
| ---------- | ------- | --------- | ------ | --------- | ------- | ------- |
| files:1    | 1.00×   | 4.3117    | ±2.74% | 6.3807    | 232     | 116     |
| files:100  | 0.029×  | 147.9682  | ±8.73% | 182.7819  | 7       | 10      |
| files:1000 | 0.0038× | 1147.1865 | ±6.10% | 1320.6102 | 1       | 10      |
