# Benchmark results

Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff
Over time to catch regressions.

## Environment

- Date: 2026-06-23T15:06:10.389Z
- Node: v26.3.0
- OS: win32 10.0.26200 (x64)
- CPU: AMD Ryzen 7 7730U with Radeon Graphics × 16
- RAM: 38.8 GiB

## src/services/sandbox/createSandbox.bench.ts > createSandbox exec vs native baseline

| task    | mean (ms) | sd      | p99 (ms) | ops/sec | samples |
| ------- | --------- | ------- | -------- | ------- | ------- |
| native  | 142.4895  | 13.8607 | 165.1187 | 7       | 10      |
| sandbox | 130.2525  | 8.3973  | 141.9500 | 8       | 10      |

## src/services/source/loadFilesSource.bench.ts > loadFilesSource — load + dispose by file count

| task       | mean (ms) | sd       | p99 (ms)  | ops/sec | samples |
| ---------- | --------- | -------- | --------- | ------- | ------- |
| files:1    | 2.7712    | 2.1845   | 7.0181    | 361     | 181     |
| files:100  | 78.4385   | 5.6296   | 87.7180   | 13      | 10      |
| files:1000 | 1183.7637 | 202.0919 | 1440.0607 | 1       | 10      |
