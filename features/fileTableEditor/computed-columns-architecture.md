# Computed Columns — Architecture

## Design Philosophy

Inspired by Vue 3's computed refs: a computed column declares its dependency upfront (`sourceColumnId`) and its value is computed lazily on access — never stored, always fresh. Unlike Vue's reactive computed, we skip caching because row values are plain objects (not reactive), so there's no dirty-tracking overhead and evaluation is cheap.

The key invariant: **source data is the only source of truth**. Computed values are a pure function of it.

---

## `ColumnTransformation` — Discriminated Union

Each transformation variant is a plain interface identified by a `ColumnTransformationType` discriminant. New variants can be added without touching existing ones.

```
ColumnTransformationType (enum)
├── ExtractPattern    — regex capture group extraction from a string value
├── ConvertTo         — type coercion: string → Number | Boolean | Date | String
├── MathOperation     — arithmetic or rounding against a constant
└── DatePart          — extract a calendar field (Year, Month, Day, Weekday, Hour, Minute)
```

### Variant shapes

```typescript
// ExtractPatternTransformation
{ type: ExtractPattern, pattern: string, groupIndex: number }
// e.g. extract domain from email: pattern="@(.+)", groupIndex=1

// ConvertToTransformation
{ type: ConvertTo, targetType: ColumnType, dateFormat?: string }
// dateFormat only required when targetType = Date

// MathOperationTransformation
{ type: MathOperation, operation: MathOperation, operand?: number }
// MathOperation: Multiply | Divide | Add | Subtract | Round | Floor | Ceil | Abs
// operand required for Multiply/Divide/Add/Subtract; omitted for Round/Floor/Ceil/Abs

// DatePartTransformation
{ type: DatePart, part: DatePart, inputFormat: string }
// DatePart: Year | Month | Day | Weekday | Hour | Minute
```

---

## `ComputedColumn`

Follows the same pattern as `DateColumn extends Column<ColumnType.Date>`:

```typescript
class ComputedColumn extends Column<ColumnType.Computed> {
  readonly type = ColumnType.Computed;
  sourceColumnId: string; // declared dependency — stable ID of the source column
  transformation: ColumnTransformation;
}
```

`ColumnType.Computed` is added to the enum. The schema follows `createColumnSchema` factory pattern.

---

## Evaluation Layer

```typescript
// Pure function — no side effects, fully testable
evaluateColumnTransformation(value: ColumnValue, transformation: ColumnTransformation): ColumnValue
```

Switch on `transformation.type`, one case per variant. Each case is independently testable.

---

## Integration: Lazy Resolver

Mirrors Vue 3 computed's lazy getter — value is only resolved when accessed:

```typescript
// resolveValue(row, columns, column): ColumnValue
// → ComputedColumn: find source column by sourceColumnId → use source.name to read row.data (keyed by name, kept in sync by UpdateColumnCommand)
//                   → evaluateColumnTransformation(row.data[source.name], transformation)
// → All other columns: row.data[column.name]
```

`resolveValue` replaces raw `row.data[column.name]` / `takeOne(row.data, column.name)` at every **read** site:

| Read site                         | Purpose                                                   |
| --------------------------------- | --------------------------------------------------------- |
| `Row/Table.vue` header `value` fn | Sort and `v-data-table` search operate on computed values |
| `Row/ItemSlot.vue`                | Cell rendering                                            |
| `FooterSlot.vue`                  | Column sum/summary                                        |
| CSV / JSON / XLSX serializers     | Export includes computed values                           |

**Write sites are unchanged** — `row.data` is only written for real (non-computed) columns. Computed columns are always read-only.

---

## Constraints (v2 scope)

- **Read-only** — cell editing disabled for computed columns
- **Single source** — one `sourceColumnId` per computed column; no cross-column expressions
- **No chaining** — a computed column cannot source another computed column
- **Not stored in `row.data`** — only `column.transformation` is persisted; computed values are always recomputed

---

## File Plan

| File                                                                          | Notes                                                                                               |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `shared/models/tableEditor/file/ColumnType.ts`                                | Add `Computed`                                                                                      |
| `shared/models/tableEditor/file/ColumnTransformationType.ts`                  | New enum                                                                                            |
| `shared/models/tableEditor/file/ColumnTransformation.ts`                      | Discriminated union of all variants                                                                 |
| `shared/models/tableEditor/file/ComputedColumn.ts`                            | Class + Zod schema                                                                                  |
| `app/services/tableEditor/file/column/evaluateColumnTransformation.ts`        | Pure evaluator (switch on type)                                                                     |
| `app/services/tableEditor/file/column/resolveValue.ts`                        | Lazy resolver replacing raw `row.data` access                                                       |
| `app/models/tableEditor/file/commands/CreateComputedColumnCommand.ts`         | Inserts column, no row.data writes                                                                  |
| `app/composables/tableEditor/file/commands/useCreateComputedColumn.ts`        | Composable wrapping command + history                                                               |
| `app/components/TableEditor/File/Column/CreateComputedColumnDialogButton.vue` | UI entry point                                                                                      |
| `app/components/TableEditor/File/Column/ComputedColumnForm.vue`               | Transformation config form (source column selector + transformation type + variant-specific fields) |
