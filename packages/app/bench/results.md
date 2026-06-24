# Benchmark results

Auto-generated beside `bench/results.json` by the BenchmarkMarkdownReporter on `pnpm bench`. Diff
Over time to catch regressions. `vs base` is a throughput multiplier against each group's baseline
(the `native` task, else the first): `1.00×` is the baseline, higher is faster, lower is slower — a
fast task drifting back toward `1.00×` is a regression. `±rme` is the relative margin of error.
Numbers are machine- and commit-dependent (see Environment); only compare runs from the same host.

## Environment

- Date: 2026-06-24T01:38:13.103Z
- Commit: 6b6a5a030
- Node: v26.3.1
- OS: win32 10.0.26200 (x64)
- CPU: AMD Ryzen 7 7730U with Radeon Graphics × 16
- RAM: 38.8 GiB

## app/models/tableEditor/file/commands/CreateRowsCommand.bench.ts > CreateRowsCommand

| task                                   | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| -------------------------------------- | ------- | --------- | ------ | -------- | ------- | ------- |
| execute — insert 100 rows into 100     | 1.00×   | 0.0602    | ±1.00% | 0.1310   | 16621   | 8311    |
| execute — insert 100 rows into 1000    | 0.88×   | 0.0682    | ±1.13% | 0.1545   | 14665   | 7333    |
| execute — insert 1000 rows into 10000  | 0.096×  | 0.6251    | ±2.08% | 1.1746   | 1600    | 800     |
| execute — insert 10000 rows into 10000 | 0.0098× | 6.1178    | ±7.54% | 12.5031  | 163     | 82      |
| undo — remove 100 rows from 200        | 0.44×   | 0.1366    | ±1.31% | 0.2739   | 7323    | 3662    |
| undo — remove 1000 rows from 11000     | 0.047×  | 1.2822    | ±2.42% | 2.2389   | 780     | 390     |
| undo — remove 10000 rows from 20000    | 0.0053× | 11.3845   | ±7.66% | 18.0680  | 88      | 45      |

## app/models/tableEditor/file/commands/DeleteColumnsCommand.bench.ts > DeleteColumnsCommand

| task                                        | vs base  | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ------------------------------------------- | -------- | --------- | ------ | -------- | ------- | ------- |
| execute — delete 1 of 5 columns, 100 rows   | 1.00×    | 0.0068    | ±0.89% | 0.0240   | 146817  | 73409   |
| execute — delete 1 of 5 columns, 1000 rows  | 0.088×   | 0.0777    | ±1.10% | 0.1708   | 12869   | 6435    |
| execute — delete 1 of 5 columns, 10000 rows | 0.0054×  | 1.2635    | ±5.75% | 3.8320   | 791     | 396     |
| execute — delete 3 of 5 columns, 1000 rows  | 0.034×   | 0.1982    | ±1.31% | 0.3613   | 5045    | 2523    |
| execute — delete 3 of 5 columns, 10000 rows | 0.0016×  | 4.3597    | ±9.11% | 11.3833  | 229     | 115     |
| undo — restore 1 column into 1000 rows      | 0.0064×  | 1.0591    | ±3.98% | 2.6525   | 944     | 473     |
| undo — restore 3 columns into 10000 rows    | 0.00047× | 14.3403   | ±8.79% | 21.9850  | 70      | 36      |

## app/models/tableEditor/file/commands/DeleteRowsCommand.bench.ts > DeleteRowsCommand

| task                                  | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ------------------------------------- | ------- | --------- | ------ | -------- | ------- | ------- |
| execute — delete 50 rows from 100     | 1.00×   | 0.0468    | ±1.19% | 0.1217   | 21389   | 10695   |
| execute — delete 500 rows from 1000   | 0.083×  | 0.5624    | ±1.67% | 0.8795   | 1778    | 890     |
| execute — delete 5000 rows from 10000 | 0.0074× | 6.3285    | ±4.61% | 9.3241   | 158     | 80      |
| undo — re-insert 50 rows into 50      | 0.37×   | 0.1251    | ±1.17% | 0.2478   | 7992    | 3997    |
| undo — re-insert 500 rows into 500    | 0.03×   | 1.5424    | ±4.05% | 3.5377   | 648     | 325     |
| undo — re-insert 5000 rows into 5000  | 0.0024× | 19.6956   | ±9.23% | 33.8502  | 51      | 26      |

## app/models/tableEditor/file/commands/MoveColumnCommand.bench.ts > MoveColumnCommand

| task                                      | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ----------------------------------------- | ------- | --------- | ------ | -------- | ------- | ------- |
| execute — move col 0→4, 100 rows          | 1.00×   | 0.0428    | ±0.95% | 0.0857   | 23341   | 11671   |
| execute — move col 0→4, 1000 rows         | 0.1×    | 0.4288    | ±1.36% | 0.5947   | 2332    | 1167    |
| execute — move col 0→4, 10000 rows        | 0.008×  | 5.3256    | ±4.09% | 7.7849   | 188     | 94      |
| undo — move col 0→4 then back, 1000 rows  | 0.072×  | 0.5931    | ±2.26% | 1.3214   | 1686    | 843     |
| undo — move col 0→4 then back, 10000 rows | 0.0071× | 6.0501    | ±6.09% | 13.8492  | 165     | 83      |

## app/models/tableEditor/file/commands/UpdateColumnCommand.bench.ts > UpdateColumnCommand

| task                          | vs base  | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ----------------------------- | -------- | --------- | ------ | -------- | ------- | ------- |
| execute (rename) — 100 rows   | 1.00×    | 0.0057    | ±1.05% | 0.0246   | 174058  | 87029   |
| execute (rename) — 1000 rows  | 0.19×    | 0.0302    | ±1.04% | 0.0853   | 33061   | 16531   |
| execute (rename) — 10000 rows | 0.03×    | 0.1925    | ±2.84% | 0.8075   | 5196    | 2599    |
| undo (rename) — 1000 rows     | 0.0054×  | 1.0664    | ±1.88% | 1.5028   | 938     | 469     |
| undo (rename) — 10000 rows    | 0.00049× | 11.7238   | ±2.93% | 15.0083  | 85      | 43      |

## app/services/tableEditor/file/commands/findDuplicateRows.bench.ts > findDuplicateRows

| task                                 | vs base | mean (ms) | ±rme   | p99 (ms) | ops/sec | samples |
| ------------------------------------ | ------- | --------- | ------ | -------- | ------- | ------- |
| First mode — 100 rows, 50 unique     | 1.00×   | 0.0514    | ±0.98% | 0.1105   | 19453   | 9727    |
| Last mode — 100 rows, 50 unique      | 1.05×   | 0.0490    | ±1.27% | 0.1301   | 20421   | 10211   |
| First mode — 1000 rows, 500 unique   | 0.11×   | 0.4729    | ±1.62% | 0.9416   | 2114    | 1058    |
| Last mode — 1000 rows, 500 unique    | 0.13×   | 0.4024    | ±1.28% | 0.8632   | 2485    | 1243    |
| First mode — 10000 rows, 5000 unique | 0.01×   | 5.0938    | ±3.60% | 8.5621   | 196     | 99      |
| Last mode — 10000 rows, 5000 unique  | 0.0092× | 5.5845    | ±3.02% | 7.6655   | 179     | 90      |
