---
title: Sheet computed columns in datasets
description: Proposal — a Sheet serves its computed columns in its dataset, evaluated on the server by the same compute the grid runs, so a dashboard can chart a year pulled from a date or a total built from two columns.
model: claude-opus-5-5
---

# Sheet Computed Columns in Datasets

A person who adds a [computed column](/docs/resource/sheet/computed-columns) to a Sheet (the year of a date, a regex match, a sum of two columns) and then binds the Sheet to a Dashboard finds that column missing from the binding's pickers. `dataSourceToDataset` leaves every computed column out of the Sheet's dataset ([datasets](/docs/architecture/dataset)), because their values are worked out in the browser and the stored rows hold none. The export dialog already computes them, through `filterDataSourceColumns`. So the dataset is the only reader of a Sheet that can't see them. Power BI treats a calculated column as a field like any other: it appears in the Fields list and goes onto a visual the same way.

## What it adds

- **The compute moves to `shared/`.** `computeValue`, `ColumnTransformationComputeMap` and the transformation computers under `app/services/resource/sheet/column/transformation/`, plus `getEffectiveColumnType` and what they import from `app/` (`coerceValue`, `getAverage`, `getSummation`, `decompileVariables` and the computer and context types), move to `apps/web/shared/`. The grid, the export and the server then run one implementation. The move is mechanical: none of it reads a store, the DOM or a composable.
- **`dataSourceToDataset` serves computed columns.** Each one becomes a dataset column typed by `getEffectiveColumnType` (its transformation's result type, which is never `Computed`), and each row's value comes from `computeValue` over every row of the Sheet. An aggregation column therefore gives the same value in the dataset as in the grid. The row cap in `readSheetDataset` still applies after computing, so an aggregation sees every row, not just the first page.
- **`DatasetColumnType` stays "`ColumnType` minus `Computed`".** Only the column's origin changes; no consumer ever sees the type `Computed`.

```mermaid
flowchart LR
  BLOB[("Sheet content blob")] --> DS[dataSourceToDataset]
  DS -->|stored columns| COLS[dataset columns]
  DS -->|"computed columns → computeValue (shared)"| COLS
  COLS --> CAP[row cap] --> BIND[Dashboard binding / Sheet import / Program audience]
```

## What is deliberately not in it

- **No cached values.** Values are computed on every read, as the grid computes them. A cache waits on [computed value cache](/docs/resource/sheet/deferred/computed-value-cache)'s trigger.
- **No formula language.** Computed columns keep their fixed transformation set; a free-form expression column is a different feature.

## Key files

| File                                                             | Role after the change                                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `apps/web/shared/services/resource/sheet/dataSourceToDataset.ts` | serves each computed column, typed by its result, valued by computeValue   |
| `apps/web/shared/services/resource/sheet/column/computeValue.ts` | moved from `app/`, the one compute the grid, export and server share       |
| `apps/web/server/services/dataset/sheet/readSheetDataset.ts`     | caps rows after computing, so aggregations see the whole sheet             |
| `apps/web/content/docs/architecture/dataset.md`                  | the column-type note now says computed columns are served, typed by result |

## Sources

- [Power BI — Using calculated columns in Power BI Desktop](https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-calculated-columns): calculated columns "appear in the Fields list just like any other field" and can be added "to a report visualization just like other fields".
