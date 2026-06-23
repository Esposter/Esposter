# Benchmark results

Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff
Over time to catch regressions.

## Environment

- Date: 2026-06-23T13:58:41.028Z
- Node: v26.3.0
- OS: win32 10.0.26200 (x64)
- CPU: AMD Ryzen 7 7730U with Radeon Graphics × 16
- RAM: 38.8 GiB

## src/services/sandbox/createSandbox.bench.ts > createSandbox exec vs native baseline

| task    | mean (ms) | sd      | p99 (ms) | ops/sec | samples |
| ------- | --------- | ------- | -------- | ------- | ------- |
| native  | 120.1667  | 11.0886 | 141.0133 | 8       | 10      |
| sandbox | 118.6109  | 10.1122 | 136.9625 | 8       | 10      |

## src/services/source/loadFilesSource.bench.ts > loadFilesSource — load + dispose by file count

| task       | mean (ms) | sd      | p99 (ms) | ops/sec | samples |
| ---------- | --------- | ------- | -------- | ------- | ------- |
| files:1    | 3.0873    | 0.6182  | 5.8660   | 324     | 163     |
| files:100  | 82.4980   | 11.6918 | 106.3355 | 12      | 10      |
| files:1000 | 779.2841  | 77.4296 | 917.2574 | 1       | 10      |
