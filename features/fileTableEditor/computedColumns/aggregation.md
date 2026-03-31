# Aggregation Columns

## Design (v3 refactor)

Aggregation is now a `ColumnTransformationType` variant (`ColumnTransformationType.Aggregation`) rather than a separate `ColumnType`. Aggregation columns are ordinary `ComputedColumn` instances with `transformation.type === ColumnTransformationType.Aggregation`.

The `AggregationColumn` class and `ColumnType.Aggregation` enum value have been removed.

---

## `AggregationTransformation`

```typescript
interface AggregationTransformation extends ItemEntityType<ColumnTransformationType.Aggregation>, SourceColumnId {
  aggregationType: AggregationTransformationType;
}

enum AggregationTransformationType {
  PercentOfTotal,
  Rank,
  RunningSum,
}
```

---

## Evaluator

```typescript
computeAggregationValue(
  rows: Row[],
  findSource: (sourceColumnId: string) => Column | undefined,
  transformation: AggregationTransformation,
  rowIndex: number,
): ColumnValue
```

The aggregation resolver is registered in `ColumnTransformationComputeMap` under `ColumnTransformationType.Aggregation`. `ComputeContext` carries optional `rows?: Row[]` and `rowIndex?: number` so `computeValue` can pass dataset context through to the aggregation resolver.

---

## Aggregation Types

| Type             | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| `PercentOfTotal` | `row[sourceColumn] / sum(all rows[sourceColumn]) * 100`         |
| `Rank`           | Position of `row[sourceColumn]` when all rows sorted descending |
| `RunningSum`     | Cumulative sum of `row[sourceColumn]` from row 0 to `rowIndex`  |
