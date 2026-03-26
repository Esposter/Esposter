# Computed Columns — Transformations

Each transformation variant is a plain object identified by a `ColumnTransformationType` discriminant. New variants can be added without touching existing ones.

## `ColumnTransformation` Union

```
ColumnTransformationType
├── ConvertTo        — type coercion: string → Number | Boolean | Date | String
├── DatePart         — extract a calendar field (Year, Month, Day, Weekday, Hour, Minute)
├── RegexMatch       — regex capture group extraction from a string value
├── MathOperation    — composable arithmetic/rounding step sequence (see MathOperation.md)
└── StringPattern    — multi-column string templating via positional pattern (see StringPattern.md)
```

---

## Source Column Mixins

All single-source variants extend `WithSourceColumnId`. Multi-source variants extend `WithSourceColumnIds`.

```typescript
// WithSourceColumnId — single source
{ sourceColumnId: string }

// WithSourceColumnIds — multi-source
{ sourceColumnIds: string[] }
```

---

## `ConvertTo`

Extends `WithSourceColumnId`.

```typescript
{ type: ConvertTo, sourceColumnId: string, targetType: ColumnType }
// dateFormat removed — date parsing reads from the resulting column's format field (see display.md)
```

---

## `DatePart`

Extends `WithSourceColumnId`.

```typescript
{ type: DatePart, sourceColumnId: string, part: DatePartType }
// inputFormat removed — date parsing reads from the source column's format field (see display.md)
// DatePartType: Year | Month | Day | Weekday | Hour | Minute
```

---

## `RegexMatch`

Extends `WithSourceColumnId`.

```typescript
{ type: RegexMatch, sourceColumnId: string, pattern: string, groupIndex: number }
// e.g. extract domain from email: pattern="@(.+)", groupIndex=1
```

---

## `MathOperation`

See [`MathOperation.md`](./MathOperation.md) for full design rationale and composability.

Does **not** extend `WithSourceColumnId` — sources are embedded in `first` and `steps`.

---

## `StringPattern`

See [`StringPattern.md`](./StringPattern.md) for full design and UI.

Extends `WithSourceColumnIds`.
