# Computed Columns — Overview

Lazy, never-stored values — pure function of source data. No caching needed (row values are plain objects, no dirty-tracking).

---

## `ComputedColumn`

Follows the same pattern as `DateColumn extends Column<ColumnType.Date>`:

```typescript
class ComputedColumn extends Column<ColumnType.Computed> {
  readonly type = ColumnType.Computed;
  transformation: ColumnTransformation;
}
```

`ColumnType.Computed` is added to the enum. The schema follows the `createColumnSchema` factory pattern. Computed columns are always read-only — write sites are unchanged and never touch computed columns.

---

## Lazy Resolver — `computeValue`

Mirrors Vue 3 computed's lazy getter: value is only resolved when accessed. Cycle detection is handled inline via a `visited: Set<string>` parameter — cycles short-circuit to `null` rather than requiring a separate pre-validation step.

```
computeValue(rows, row, columns, column, rowIndex?, visited = new Set()):
  ComputedColumn
    if visited.has(column.id) → null (cycle guard)
    Aggregation      → computeAggregationValue(rows, findSource, transformation, rowIndex) via ColumnTransformationComputeMap
    String           → computeStringTransformation(String(value), stringTransformationType) — single sourceColumnId
    StringPattern    → resolve all sourceColumnIds → computeStringPatternTransformation(values, pattern)
    Math             → resolve all sourceColumnId variable bindings → computeMathTransformation(transformation, computeSource)
    all others       → resolve single sourceColumnId → ColumnTransformationComputeMap[type](transformation, context)
  all other columns  → takeOne(row.data, column.name)
```

`computeValue` replaces raw `row.data[column.name]` at every read site:

| Read site                         | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `Row/Table.vue` header `value` fn | Sort and search operate on computed values |
| `Row/ItemSlot.vue`                | Cell rendering                             |
| `FooterSlot.vue`                  | Column sum/summary                         |
| CSV / JSON / XLSX serializers     | Export includes computed values            |

`AggregationTransformation` requires `rows` and `rowIndex` — `computeValue` passes these as optional through `ComputeContext`, only used when an aggregation transformation is present.

---

## Constraints

| Constraint                               | v2                                              | v3                               |
| ---------------------------------------- | ----------------------------------------------- | -------------------------------- |
| Single source per transformation         | ✓ (except `StringPattern` and `Math` variables) | lifted for multi-source variants |
| No chaining (computed sourcing computed) | ✓                                               | lifted — cycle detection added   |
| Not stored in `row.data`                 | ✓                                               | ✓ (unchanged)                    |
| Read-only                                | ✓                                               | ✓ (unchanged)                    |

**Chaining (v3)**: Cycle detection is inline in `computeValue` via a `visited: Set<string>` parameter. `computeValue` becomes recursive for computed sources; cycles short-circuit to `null`.

---

## File Plan

### Shared models

| File                                                                                         | Notes                                                        |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `shared/models/tableEditor/file/column/ColumnType.ts`                                        | `Computed` added (v2)                                        |
| `shared/models/tableEditor/file/column/Column.ts`                                            | Union of all column types                                    |
| `shared/models/tableEditor/file/column/ComputedColumn.ts`                                    | Class + Zod schema                                           |
| `shared/models/tableEditor/file/column/transformation/ColumnTransformationType.ts`           | Enum including `Aggregation` (v3), `String` (v4)             |
| `shared/models/tableEditor/file/column/transformation/ColumnTransformation.ts`               | Discriminated union                                          |
| `shared/models/tableEditor/file/column/transformation/AggregationTransformation.ts`          | `AggregationTransformation` interface + schema               |
| `shared/models/tableEditor/file/column/transformation/AggregationTransformationType.ts`      | Enum (v3)                                                    |
| `shared/models/tableEditor/file/column/transformation/SourceColumnId.ts`                     | Single-source mixin                                          |
| `shared/models/tableEditor/file/column/transformation/SourceColumnIds.ts`                    | Multi-source mixin (v3)                                      |
| `shared/models/tableEditor/file/column/transformation/ConvertToTransformation.ts`            |                                                              |
| `shared/models/tableEditor/file/column/transformation/DatePartTransformation.ts`             |                                                              |
| `shared/models/tableEditor/file/column/transformation/RegexMatchTransformation.ts`           |                                                              |
| `shared/models/tableEditor/file/column/transformation/MathTransformation.ts`                 | mathjs expressions (v3)                                      |
| `shared/models/tableEditor/file/column/transformation/string/StringTransformation.ts`        | Basic string ops: Lowercase, TitleCase, Trim, Uppercase (v4) |
| `shared/models/tableEditor/file/column/transformation/string/StringTransformationType.ts`    | Enum (v4)                                                    |
| `shared/models/tableEditor/file/column/transformation/string/StringPatternTransformation.ts` | Multi-column `{N}` pattern (v3)                              |

### App services

| File                                                                                               | Notes                                                             |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `app/services/tableEditor/file/column/computeValue.ts`                                             | Lazy resolver with inline cycle detection                         |
| `app/services/tableEditor/file/column/computeAggregationValue.ts`                                  | `(rows, findSource, transformation, rowIndex) → ColumnValue` (v3) |
| `app/services/tableEditor/file/column/formatValue.ts`                                              | Display-layer format application (v3)                             |
| `app/services/tableEditor/file/column/transformation/ColumnTransformationComputeMap.ts`            | Dispatch map keyed by `ColumnTransformationType`                  |
| `app/services/tableEditor/file/column/transformation/computeConvertToTransformation.ts`            |                                                                   |
| `app/services/tableEditor/file/column/transformation/computeDatePartTransformation.ts`             |                                                                   |
| `app/services/tableEditor/file/column/transformation/computeRegexMatchTransformation.ts`           |                                                                   |
| `app/services/tableEditor/file/column/transformation/computeMathTransformation.ts`                 | mathjs evaluate (v3)                                              |
| `app/services/tableEditor/file/column/transformation/string/computeStringTransformation.ts`        | Basic string ops dispatch (v4)                                    |
| `app/services/tableEditor/file/column/transformation/string/computeStringPatternTransformation.ts` | `{N}` token substitution (v3)                                     |

### App commands + composables

| File                                                                   | Notes |
| ---------------------------------------------------------------------- | ----- |
| `app/models/tableEditor/file/commands/CreateComputedColumnCommand.ts`  |       |
| `app/composables/tableEditor/file/commands/useCreateComputedColumn.ts` |       |

### App components

| File                                                                          | Notes                   |
| ----------------------------------------------------------------------------- | ----------------------- |
| `app/components/TableEditor/File/Column/CreateComputedColumnDialogButton.vue` |                         |
| `app/components/TableEditor/File/Column/ComputedColumnForm.vue`               |                         |
| `app/components/TableEditor/File/Column/PatternInput.vue`                     | (v3) — see `display.md` |
