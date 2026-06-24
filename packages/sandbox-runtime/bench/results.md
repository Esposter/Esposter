# Benchmark results

Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff
Over time to catch regressions.

## Environment

- Date: 2026-06-24T00:53:03.734Z
- Node: v26.3.1
- OS: win32 10.0.26200 (x64)
- CPU: AMD Ryzen 7 7730U with Radeon Graphics × 16
- RAM: 38.8 GiB

## src/services/exec/createVfsBackend.bench.ts > createVfsBackend — in-process node -e vs native spawn (hot path)

| task   | mean (ms) | sd      | p99 (ms) | ops/sec | samples |
| ------ | --------- | ------- | -------- | ------- | ------- |
| native | 144.7938  | 13.5934 | 167.3646 | 7       | 10      |
| vfs    | 0.0169    | 0.0357  | 0.0486   | 59269   | 29635   |

## src/services/exec/createVfsBackend.bench.ts > createVfsBackend — fall-back command vs native (no added overhead)

| task   | mean (ms) | sd      | p99 (ms) | ops/sec | samples |
| ------ | --------- | ------- | -------- | ------- | ------- |
| native | 138.1791  | 8.4310  | 156.0730 | 7       | 10      |
| vfs    | 144.3103  | 15.0816 | 171.0587 | 7       | 10      |

## src/services/source/loadFilesSource.bench.ts > loadFilesSource — load + dispose by file count

| task       | mean (ms) | sd       | p99 (ms)  | ops/sec | samples |
| ---------- | --------- | -------- | --------- | ------- | ------- |
| files:1    | 4.1032    | 0.6493   | 5.5003    | 244     | 122     |
| files:100  | 141.3214  | 13.1171  | 169.4644  | 7       | 10      |
| files:1000 | 1169.0506 | 131.8353 | 1492.3296 | 1       | 10      |

## src/services/sandbox/createSandbox.bench.ts > createSandbox exec vs native baseline

| task    | mean (ms) | sd      | p99 (ms) | ops/sec | samples |
| ------- | --------- | ------- | -------- | ------- | ------- |
| native  | 162.1802  | 12.5633 | 178.2933 | 6       | 10      |
| sandbox | 136.2548  | 7.5333  | 146.0878 | 7       | 10      |
