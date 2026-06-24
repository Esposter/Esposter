# Benchmark results

Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff
Over time to catch regressions.

## Environment

- Date: 2026-06-23T15:08:05.136Z
- Node: v26.3.0
- OS: win32 10.0.26200 (x64)
- CPU: AMD Ryzen 7 7730U with Radeon Graphics × 16
- RAM: 38.8 GiB

## app/models/tableEditor/file/commands/CreateRowsCommand.bench.ts > CreateRowsCommand

| task                                   | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| -------------------------------------- | --------- | ------ | -------- | ------- | ------- |
| execute — insert 100 rows into 100     | 0.0406    | 0.0151 | 0.0851   | 24613   | 12307   |
| execute — insert 100 rows into 1000    | 0.0465    | 0.0199 | 0.0956   | 21522   | 10761   |
| execute — insert 1000 rows into 10000  | 0.4767    | 0.1326 | 0.9741   | 2098    | 1049    |
| execute — insert 10000 rows into 10000 | 4.5805    | 1.3422 | 10.2957  | 218     | 110     |
| undo — remove 100 rows from 200        | 0.0838    | 0.0309 | 0.2025   | 11929   | 5965    |
| undo — remove 1000 rows from 11000     | 0.8678    | 0.1886 | 1.5998   | 1152    | 577     |
| undo — remove 10000 rows from 20000    | 9.0196    | 2.8743 | 20.9270  | 111     | 56      |

## app/models/tableEditor/file/commands/DeleteColumnsCommand.bench.ts > DeleteColumnsCommand

| task                                        | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| ------------------------------------------- | --------- | ------ | -------- | ------- | ------- |
| execute — delete 1 of 5 columns, 100 rows   | 0.0050    | 0.0053 | 0.0115   | 200405  | 100203  |
| execute — delete 1 of 5 columns, 1000 rows  | 0.0395    | 0.0145 | 0.0850   | 25338   | 12670   |
| execute — delete 1 of 5 columns, 10000 rows | 0.4966    | 0.0997 | 0.9665   | 2014    | 1007    |
| execute — delete 3 of 5 columns, 1000 rows  | 0.1148    | 0.0257 | 0.2042   | 8710    | 4355    |
| execute — delete 3 of 5 columns, 10000 rows | 1.5575    | 0.4208 | 2.9355   | 642     | 322     |
| undo — restore 1 column into 1000 rows      | 0.5139    | 0.1158 | 1.0308   | 1946    | 973     |
| undo — restore 3 columns into 10000 rows    | 6.7651    | 1.0105 | 10.4174  | 148     | 74      |

## app/models/tableEditor/file/commands/DeleteRowsCommand.bench.ts > DeleteRowsCommand

| task                                  | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| ------------------------------------- | --------- | ------ | -------- | ------- | ------- |
| execute — delete 50 rows from 100     | 0.0292    | 0.0161 | 0.0742   | 34250   | 17126   |
| execute — delete 500 rows from 1000   | 0.2486    | 0.0534 | 0.4947   | 4022    | 2011    |
| execute — delete 5000 rows from 10000 | 2.7803    | 0.5882 | 4.9726   | 360     | 180     |
| undo — re-insert 50 rows into 50      | 0.0486    | 0.0172 | 0.0980   | 20567   | 10284   |
| undo — re-insert 500 rows into 500    | 0.4823    | 0.0955 | 0.8671   | 2073    | 1037    |
| undo — re-insert 5000 rows into 5000  | 4.7277    | 0.7056 | 7.4401   | 212     | 106     |

## app/models/tableEditor/file/commands/MoveColumnCommand.bench.ts > MoveColumnCommand

| task                                      | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| ----------------------------------------- | --------- | ------ | -------- | ------- | ------- |
| execute — move col 0→4, 100 rows          | 0.0246    | 0.0125 | 0.0542   | 40629   | 20315   |
| execute — move col 0→4, 1000 rows         | 0.2649    | 0.1241 | 0.7260   | 3775    | 1888    |
| execute — move col 0→4, 10000 rows        | 2.3067    | 0.6743 | 4.7826   | 434     | 217     |
| undo — move col 0→4 then back, 1000 rows  | 0.4184    | 0.1073 | 0.9434   | 2390    | 1196    |
| undo — move col 0→4 then back, 10000 rows | 4.1034    | 0.7159 | 6.5823   | 244     | 122     |

## app/models/tableEditor/file/commands/UpdateColumnCommand.bench.ts > UpdateColumnCommand

| task                          | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| ----------------------------- | --------- | ------ | -------- | ------- | ------- |
| execute (rename) — 100 rows   | 0.0025    | 0.0049 | 0.0058   | 394277  | 197139  |
| execute (rename) — 1000 rows  | 0.0101    | 0.0121 | 0.0259   | 98911   | 49456   |
| execute (rename) — 10000 rows | 0.1180    | 0.0438 | 0.2257   | 8471    | 4236    |
| undo (rename) — 1000 rows     | 0.4521    | 0.0916 | 0.8885   | 2212    | 1106    |
| undo (rename) — 10000 rows    | 4.7322    | 0.7911 | 7.1703   | 211     | 107     |

## app/services/tableEditor/file/commands/findDuplicateRows.bench.ts > findDuplicateRows

| task                                 | mean (ms) | sd     | p99 (ms) | ops/sec | samples |
| ------------------------------------ | --------- | ------ | -------- | ------- | ------- |
| First mode — 100 rows, 50 unique     | 0.0343    | 0.0198 | 0.0831   | 29160   | 14580   |
| Last mode — 100 rows, 50 unique      | 0.0363    | 0.0241 | 0.0951   | 27552   | 13785   |
| First mode — 1000 rows, 500 unique   | 0.3498    | 0.0991 | 0.7916   | 2859    | 1430    |
| Last mode — 1000 rows, 500 unique    | 0.4476    | 0.1477 | 1.0225   | 2234    | 1119    |
| First mode — 10000 rows, 5000 unique | 5.5607    | 1.4588 | 9.7562   | 180     | 90      |
| Last mode — 10000 rows, 5000 unique  | 5.4810    | 1.2820 | 9.0996   | 182     | 92      |
