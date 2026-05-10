# Display Layer

## Format Field

**Not** on the base `Column` class. Each column type maps to its own format type — assigning the wrong format type is a compile-time error.

`column.format` serves dual purpose: **parsing hint** (how to read incoming strings) and **display hint** (how to render stored values). This eliminates the separate `dateFormat` field on `ConvertToTransformation` and `inputFormat` on `DatePartTransformation` — both read from the column's `format` instead.

### `ColumnFormatMap`

```typescript
type ColumnFormatMap = {
  [ColumnType.Boolean]: BooleanFormat;
  [ColumnType.Date]: DateFormat;
  [ColumnType.Number]: NumberFormat;
  [ColumnType.String]: never; // strings need no format
  [ColumnType.Computed]: ColumnFormat; // union — runtime validated against transformation output type
  [ColumnType.Aggregation]: NumberFormat; // always numeric output
};

type ColumnFormat = BooleanFormat | DateFormat | NumberFormat;

class Column<TColumnType extends ColumnType> {
  format?: ColumnFormatMap[TColumnType];
}
```

`String → never` prevents any format from being assigned at compile time. `Computed → ColumnFormat` (full union) because the output type is a runtime property of the transformation — validated against the transformation's `targetType` or output at runtime rather than threading it through the column generic chain.

### Format types

```typescript
// DateFormat — re-uses the existing DATE_FORMATS const already in the codebase
type DateFormat = (typeof DATE_FORMATS)[number];

// BooleanFormat
enum BooleanFormat {
  TrueFalse,
  YesNo,
  OneZero,
}

// NumberFormat
enum NumberFormat {
  Plain,
  Currency,
  Percentage,
  Scientific,
  Compact,
}
```

---

## Impact on Transformations

### `ConvertToTransformation` — drops `dateFormat`

Previously carried `dateFormat?: string` to parse string inputs when `targetType = Date`. This is now read from the resulting `ComputedColumn.format`:

```
computeConvertToTransformation(value, transformation, column)
// column.format: DateFormat used when transformation.targetType = Date
```

### `DatePartTransformation` — drops `inputFormat`

Previously carried `inputFormat: string` to read the source date string. This is now read from the source column:

```
computeDatePartTransformation(value, transformation, sourceColumn)
// sourceColumn.format: DateFormat used to parse the incoming date value
```

---

## `formatValue`

```typescript
formatValue(value: ColumnValue, format: ColumnFormat): string
```

Pure display function. Called at render sites after `resolveValue`. Export serializers call it when formatted output is requested. No changes to `row.data`, `resolveValue`, or the command system.

---

## Schema

`createColumnSchema` accepts an optional `formatSchema` parameter so each column type supplies its own Zod enum:

```typescript
createColumnSchema(z.literal(ColumnType.Date), z.enum(DATE_FORMATS));
createColumnSchema(z.literal(ColumnType.Boolean), z.enum(BooleanFormat));
createColumnSchema(z.literal(ColumnType.Number), z.enum(NumberFormat));
createColumnSchema(z.literal(ColumnType.String)); // no format schema — field omitted
```
