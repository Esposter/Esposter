# Benchmark results

Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff
Over time to catch regressions.

## Environment

- Date: 2026-06-23T13:44:39.892Z
- Node: v26.3.0
- OS: win32 10.0.26200 (x64)
- CPU: AMD Ryzen 7 7730U with Radeon Graphics × 16
- RAM: 38.8 GiB

## app/models/tableEditor/file/commands/CreateRowsCommand.bench.ts > CreateRowsCommand

| task                                   | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| -------------------------------------- | --------- | ------ | -------- | ------- | ------- |
| execute — insert 100 rows into 100     | 0.0410    | 0.0131 | 0.0799   | 24404   | 12203   |
| execute — insert 100 rows into 1000    | 0.0470    | 0.0198 | 0.1015   | 21274   | 10637   |
| execute — insert 1000 rows into 10000  | 0.4321    | 0.0827 | 0.8008   | 2314    | 1158    |
| execute — insert 10000 rows into 10000 | 4.1457    | 0.5329 | 5.6086   | 241     | 121     |
| undo — remove 100 rows from 200        | 0.0927    | 0.0222 | 0.1762   | 10786   | 5393    |
| undo — remove 1000 rows from 11000     | 1.0074    | 0.1706 | 1.7463   | 993     | 497     |
| undo — remove 10000 rows from 20000    | 9.6523    | 0.9822 | 12.4944  | 104     | 52      |

## app/models/tableEditor/file/commands/DeleteColumnsCommand.bench.ts > DeleteColumnsCommand

| task                                        | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| ------------------------------------------- | --------- | ------ | -------- | ------- | ------- |
| execute — delete 1 of 5 columns, 100 rows   | 0.0066    | 0.0074 | 0.0165   | 150671  | 75336   |
| execute — delete 1 of 5 columns, 1000 rows  | 0.0374    | 0.0777 | 0.0897   | 26706   | 13353   |
| execute — delete 1 of 5 columns, 10000 rows | 0.5378    | 0.2383 | 1.2483   | 1860    | 930     |
| execute — delete 3 of 5 columns, 1000 rows  | 0.0977    | 0.0236 | 0.2002   | 10232   | 5116    |
| execute — delete 3 of 5 columns, 10000 rows | 1.8351    | 0.7372 | 5.5343   | 545     | 273     |
| undo — restore 1 column into 1000 rows      | 0.4944    | 0.1209 | 1.0097   | 2023    | 1012    |
| undo — restore 3 columns into 10000 rows    | 6.5133    | 0.8752 | 9.7249   | 154     | 77      |

## app/models/tableEditor/file/commands/DeleteRowsCommand.bench.ts > DeleteRowsCommand

| task                                  | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| ------------------------------------- | --------- | ------ | -------- | ------- | ------- |
| execute — delete 50 rows from 100     | 0.0288    | 0.0126 | 0.0614   | 34669   | 17335   |
| execute — delete 500 rows from 1000   | 0.2883    | 0.0703 | 0.5698   | 3469    | 1735    |
| execute — delete 5000 rows from 10000 | 3.3390    | 0.6963 | 5.3387   | 299     | 150     |
| undo — re-insert 50 rows into 50      | 0.0526    | 0.0175 | 0.1100   | 19002   | 9502    |
| undo — re-insert 500 rows into 500    | 0.5185    | 0.1285 | 1.1398   | 1929    | 965     |
| undo — re-insert 5000 rows into 5000  | 5.5660    | 0.8240 | 8.1171   | 180     | 90      |

## app/models/tableEditor/file/commands/MoveColumnCommand.bench.ts > MoveColumnCommand

| task                                      | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| ----------------------------------------- | --------- | ------ | -------- | ------- | ------- |
| execute — move col 0→4, 100 rows          | 0.0208    | 0.0100 | 0.0400   | 48119   | 24060   |
| execute — move col 0→4, 1000 rows         | 0.1960    | 0.0455 | 0.4213   | 5101    | 2551    |
| execute — move col 0→4, 10000 rows        | 1.9173    | 0.2894 | 2.9336   | 522     | 261     |
| undo — move col 0→4 then back, 1000 rows  | 0.3773    | 0.0766 | 0.6932   | 2650    | 1326    |
| undo — move col 0→4 then back, 10000 rows | 3.8145    | 0.4611 | 5.4287   | 262     | 132     |

## app/models/tableEditor/file/commands/UpdateColumnCommand.bench.ts > UpdateColumnCommand

| task                          | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| ----------------------------- | --------- | ------ | -------- | ------- | ------- |
| execute (rename) — 100 rows   | 0.0022    | 0.0045 | 0.0052   | 445032  | 222517  |
| execute (rename) — 1000 rows  | 0.0080    | 0.0097 | 0.0173   | 124658  | 62346   |
| execute (rename) — 10000 rows | 0.0998    | 0.0348 | 0.1807   | 10020   | 5010    |
| undo (rename) — 1000 rows     | 0.4678    | 0.1000 | 0.9396   | 2138    | 1069    |
| undo (rename) — 10000 rows    | 4.0460    | 0.5867 | 6.1424   | 247     | 124     |

## app/services/tableEditor/file/commands/findDuplicateRows.bench.ts > findDuplicateRows

| task                                 | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| ------------------------------------ | --------- | ------ | -------- | ------- | ------- |
| First mode — 100 rows, 50 unique     | 0.0273    | 0.0121 | 0.0451   | 36588   | 18295   |
| Last mode — 100 rows, 50 unique      | 0.0278    | 0.0159 | 0.0598   | 35992   | 17996   |
| First mode — 1000 rows, 500 unique   | 0.2964    | 0.0509 | 0.5753   | 3374    | 1687    |
| Last mode — 1000 rows, 500 unique    | 0.3033    | 0.0796 | 0.7493   | 3297    | 1649    |
| First mode — 10000 rows, 5000 unique | 3.8395    | 0.7593 | 7.0258   | 260     | 131     |
| Last mode — 10000 rows, 5000 unique  | 4.1393    | 0.7507 | 6.3380   | 242     | 121     |
