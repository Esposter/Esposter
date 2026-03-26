# Aggregation Columns

## Why a Separate Column Type

Aggregation columns are **not** a `ColumnTransformation` variant. The row-local evaluation model (`resolveValue(row, columns, column)`) cannot express dataset-level aggregates — they require access to all rows and the current row index. A different class and evaluator signature is needed.

---

## `AggregationColumn`

```typescript
class AggregationColumn extends Column<ColumnType.Aggregation> {
  readonly type = ColumnType.Aggregation;
  sourceColumnId: string;
  aggregationType: AggregationTransformationType;
}

enum AggregationTransformationType {
  PercentOfTotal,
  Rank,
  RunningSum,
}
```

`ColumnType.Aggregation` is added to the enum alongside `ColumnType.Computed`. The schema follows the `createColumnSchema` factory pattern. Aggregation columns are always read-only and never stored in `row.data`.

---

## Evaluator

```typescript
computeAggregationValue(rows: Row[], column: AggregationColumn, rowIndex: number): ColumnValue
```

`resolveValue` gains a third branch: if the column is an `AggregationColumn`, delegate to `computeAggregationValue`. This requires `rows` and `rowIndex` — `resolveValue`'s signature gains these as optional parameters, only used when an aggregation column is in the dataset.

---

## Aggregation Types

| Type             | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| `PercentOfTotal` | `row[sourceColumn] / sum(all rows[sourceColumn]) * 100`         |
| `Rank`           | Position of `row[sourceColumn]` when all rows sorted descending |
| `RunningSum`     | Cumulative sum of `row[sourceColumn]` from row 0 to `rowIndex`  |
