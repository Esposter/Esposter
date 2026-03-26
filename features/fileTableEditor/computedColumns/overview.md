# Computed Columns — Overview

## Design Philosophy

Inspired by Vue 3's computed refs: a computed column declares its dependencies upfront and its value is computed lazily on access — never stored, always fresh. Unlike Vue's reactive computed, caching is skipped because row values are plain objects (not reactive), so there is no dirty-tracking overhead and evaluation is cheap.

**Key invariant**: source data is the only source of truth. Computed values are a pure function of it.

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

## Lazy Resolver — `resolveValue`

Mirrors Vue 3 computed's lazy getter: value is only resolved when accessed.

```
resolveValue(row, columns, column):
  AggregationColumn  → computeAggregationValue(rows, column, rowIndex)
  ComputedColumn
    StringPattern    → resolve all sourceColumnIds → computeStringPatternTransformation(values, pattern)
    MathOperation    → resolve first + each binary step's column operands (recursive)
    all others       → resolve single sourceColumnId → computeColumnTransformation(value, transformation)
  all other columns  → takeOne(row.data, column.name)
```

`resolveValue` replaces raw `row.data[column.name]` at every read site:

| Read site                         | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `Row/Table.vue` header `value` fn | Sort and search operate on computed values |
| `Row/ItemSlot.vue`                | Cell rendering                             |
| `FooterSlot.vue`                  | Column sum/summary                         |
| CSV / JSON / XLSX serializers     | Export includes computed values            |

`AggregationColumn` requires `rows` and `rowIndex` — `resolveValue` gains these as optional parameters, only needed when an aggregation column is present.

---

## Constraints

| Constraint                               | v2                                                             | v3                               |
| ---------------------------------------- | -------------------------------------------------------------- | -------------------------------- |
| Single source per transformation         | ✓ (except `StringPattern` and `MathOperation` column operands) | lifted for multi-source variants |
| No chaining (computed sourcing computed) | ✓                                                              | lifted — cycle detection added   |
| Not stored in `row.data`                 | ✓                                                              | ✓ (unchanged)                    |
| Read-only                                | ✓                                                              | ✓ (unchanged)                    |

**Chaining (v3)**: `detectColumnCycle(columns, candidateSourceIds): boolean` — DFS on the full column dependency graph. Called in `CreateComputedColumnCommand` before insertion. `resolveValue` becomes recursive for computed sources; safe because cycles are impossible post-validation.

---

## File Plan

### Shared models

| File                                                                                  | Notes                               |
| ------------------------------------------------------------------------------------- | ----------------------------------- |
| `shared/models/tableEditor/file/column/ColumnType.ts`                                 | `Computed` (v2), `Aggregation` (v3) |
| `shared/models/tableEditor/file/column/Column.ts`                                     | Add `format?: string` (v3)          |
| `shared/models/tableEditor/file/column/ComputedColumn.ts`                             | Class + Zod schema                  |
| `shared/models/tableEditor/file/column/AggregationColumn.ts`                          | Class + Zod schema (v3)             |
| `shared/models/tableEditor/file/column/AggregationTransformationType.ts`              | Enum (v3)                           |
| `shared/models/tableEditor/file/column/transformation/ColumnTransformationType.ts`    | Enum of all transformation variants |
| `shared/models/tableEditor/file/column/transformation/ColumnTransformation.ts`        | Discriminated union                 |
| `shared/models/tableEditor/file/column/transformation/WithSourceColumnId.ts`          | Single-source mixin                 |
| `shared/models/tableEditor/file/column/transformation/WithSourceColumnIds.ts`         | Multi-source mixin (v3)             |
| `shared/models/tableEditor/file/column/transformation/ConvertToTransformation.ts`     |                                     |
| `shared/models/tableEditor/file/column/transformation/DatePartTransformation.ts`      |                                     |
| `shared/models/tableEditor/file/column/transformation/RegexMatchTransformation.ts`    |                                     |
| `shared/models/tableEditor/file/column/transformation/MathOperationTransformation.ts` | Redesigned in v3                    |
| `shared/models/tableEditor/file/column/transformation/StringPatternTransformation.ts` | New (v3)                            |

### App services

| File                                                                                        | Notes                                             |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `app/services/tableEditor/file/column/resolveValue.ts`                                      | Lazy resolver                                     |
| `app/services/tableEditor/file/column/detectColumnCycle.ts`                                 | DFS cycle detection (v3)                          |
| `app/services/tableEditor/file/column/computeAggregationValue.ts`                           | `(rows, column, rowIndex) → ColumnValue` (v3)     |
| `app/services/tableEditor/file/column/formatValue.ts`                                       | Display-layer format application (v3)             |
| `app/services/tableEditor/file/column/transformation/computeColumnTransformation.ts`        | Dispatch via `ColumnTransformationTypeComputeMap` |
| `app/services/tableEditor/file/column/transformation/ColumnTransformationTypeComputeMap.ts` |                                                   |
| `app/services/tableEditor/file/column/transformation/computeConvertToTransformation.ts`     |                                                   |
| `app/services/tableEditor/file/column/transformation/computeDatePartTransformation.ts`      |                                                   |
| `app/services/tableEditor/file/column/transformation/computeRegexMatchTransformation.ts`    |                                                   |
| `app/services/tableEditor/file/column/transformation/computeMathOperationTransformation.ts` | Fold-left over `steps` (v3)                       |
| `app/services/tableEditor/file/column/transformation/computeStringPatternTransformation.ts` | `{N}` token substitution (v3)                     |

### App commands + composables

| File                                                                   | Notes                     |
| ---------------------------------------------------------------------- | ------------------------- |
| `app/models/tableEditor/file/commands/CreateComputedColumnCommand.ts`  | Cycle detection call (v3) |
| `app/composables/tableEditor/file/commands/useCreateComputedColumn.ts` |                           |

### App components

| File                                                                          | Notes                       |
| ----------------------------------------------------------------------------- | --------------------------- |
| `app/components/TableEditor/File/Column/CreateComputedColumnDialogButton.vue` |                             |
| `app/components/TableEditor/File/Column/ComputedColumnForm.vue`               |                             |
| `app/components/TableEditor/File/Column/PatternInput.vue`                     | New (v3) — see `display.md` |
