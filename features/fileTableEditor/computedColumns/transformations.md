# Computed Columns — Transformations

Each transformation variant is a plain object identified by a `ColumnTransformationType` discriminant. New variants can be added without touching existing ones.

## `ColumnTransformation` Union

```
ColumnTransformationType
├── Aggregation      — dataset-level aggregates (PercentOfTotal, Rank, RunningSum) (see aggregation.md)
├── ConvertTo        — type coercion: string → Number | Boolean | Date | String
├── DatePart         — extract a calendar field (Year, Month, Day, Weekday, Hour, Minute)
├── RegexMatch       — regex capture group extraction from a string value
├── MathOperation    — composable arithmetic/rounding step sequence (see MathOperation.md)
└── StringPattern    — multi-column string templating via positional pattern (see StringPattern.md)
```

---

## Source Column Mixins

All single-source variants extend `SourceColumnId`. Multi-source variants extend `SourceColumnIds`.

```typescript
// SourceColumnId — single source
{ sourceColumnId: string }

// SourceColumnIds — multi-source
{ sourceColumnIds: string[] }
```

---

## `Aggregation`

Extends `SourceColumnId`. See [`aggregation.md`](./aggregation.md) for full design.

```typescript
{ type: Aggregation, sourceColumnId: string, aggregationType: AggregationTransformationType }
```

---

## `ConvertTo`

Extends `SourceColumnId`.

```typescript
{ type: ConvertTo, sourceColumnId: string, targetType: ColumnType }
// dateFormat removed — date parsing reads from the resulting column's format field (see display.md)
```

---

## `DatePart`

Extends `SourceColumnId`.

```typescript
{ type: DatePart, sourceColumnId: string, part: DatePartType }
// inputFormat removed — date parsing reads from the source column's format field (see display.md)
// DatePartType: Year | Month | Day | Weekday | Hour | Minute
```

---

## `RegexMatch`

Extends `SourceColumnId`.

```typescript
{ type: RegexMatch, sourceColumnId: string, pattern: string, groupIndex: number }
// e.g. extract domain from email: pattern="@(.+)", groupIndex=1
```

---

## `MathOperation`

See [`MathOperation.md`](./MathOperation.md) for full design rationale and composability.

Does **not** extend `SourceColumnId` — sources are embedded in `first` and `steps`.

---

## `StringPattern`

See [`StringPattern.md`](./StringPattern.md) for full design and UI.

Extends `SourceColumnIds`.
