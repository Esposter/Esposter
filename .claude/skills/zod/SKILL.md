---
name: zod
description: Esposter Zod schema conventions — z namespace imports, no optional+default combos, generic schemas with create* functions, vjsf form schemas, and satisfies with ToData for class types. Apply when writing Zod schemas.
---

# Zod Conventions

## Imports

Always use the `z` namespace export: `z.ZodType`, `z.ZodError`, etc. Never use named imports like `import type { ZodType }`.

## Schema Rules

- **`.default()`** — do not combine `.optional().default(value)`; `.default()` already handles `undefined` input, so `.optional()` is redundant.
- **Generic schemas** — when an abstract class has a generic type parameter (e.g. `ADataSourceItem<TType, TConfig>`), its schema must also be generic. Export a `create*Schema` function that takes typed zod schemas as parameters and returns the composed schema. Never hardcode type-specific values in a base schema. Use `T` for a single type parameter, descriptive `T*` names (e.g. `TType`, `TConfiguration`) for multiple:
  ```typescript
  // WRONG — hardcodes type, missing configuration
  export const aDataSourceItemSchema = z.object({ ...base.shape, type: dataSourceTypeSchema });
  // CORRECT — generic function, concrete schemas passed by callers
  export const createDataSourceItemSchema = <
    TType extends z.ZodType<keyof DataSourceConfigurationTypeMap>,
    TConfiguration extends z.ZodType<object>,
  >(
    typeSchema: TType,
    configurationSchema: TConfiguration,
  ) => z.object({ ...aTableEditorItemEntitySchema.shape, configuration: configurationSchema, type: typeSchema });
  // Caller:
  export const csvDataSourceItemSchema = createDataSourceItemSchema(
    z.literal(DataSourceType.Csv),
    csvDataSourceConfigurationSchema,
  ) satisfies z.ZodType<ToData<CsvDataSourceItem>>;
  ```
  For the union schema used by parent models, create a separate `*ItemSchema.ts` file using `z.discriminatedUnion`:
  ```typescript
  export const dataSourceItemSchema = z.discriminatedUnion("type", [csvDataSourceItemSchema]);
  ```
  Adding a new type = add its schema to the discriminated union array.
- **vjsf form schemas** — never pass a full entity schema to `zodToJsonSchema()` if it contains `z.date()` fields — vjsf will throw. Create a separate `*FormSchema` co-located in the same file using `.pick().extend()` to add `.meta()` titles. The form schema picks only user-editable fields (no entity metadata like `id`, `createdAt`, `updatedAt`).
- **`.meta({ title })` values** — use enum values directly rather than string literals; `zodToJsonSchema` runs `toTitleCase(prettify(...))` on all titles automatically, so `ColumnTransformationType.ConvertTo` (`"ConvertTo"`) renders as `"Convert To"` in the UI. Always prefer `meta({ title: ColumnTransformationType.X })` over a hand-written string.
- **`.meta({ applicableColumnTypes })`** — when a transformation schema only applies to certain source column types, declare `applicableColumnTypes: ColumnType[]` in `.meta()`. This field is typed via `GlobalMeta extends Partial<WithApplicableColumnTypes>` in `shared/types/zod.d.ts`. The UI uses it to filter source column dropdowns to matching types:
  ```typescript
  .meta({ applicableColumnTypes: [ColumnType.Date], title: ColumnTransformationType.DatePart })
  .meta({ applicableColumnTypes: [ColumnType.String], title: ColumnTransformationType.RegexMatch })
  // No applicableColumnTypes = transformation accepts any source column type
  ```
- **vjsf `.meta()` layout properties** — put `comp`, `getProps`, and `getItems` directly on the field's `.meta()` in the schema definition. Do not inject them dynamically via `schema.extend()` in a composable. `GlobalMeta` for these is typed as `string` — they are vjsf JavaScript expression strings evaluated at runtime against the vjsf `context` (passed via `:options`). Example:
  ```typescript
  name: z.string().meta({
    getProps: `{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Already exists'] }`,
    title: "Name",
  }),
  sourceColumnId: z.string().meta({ comp: "select", getItems: "context.sourceColumnItems", title: "Source Column" }),
  ```
  Components pass the runtime data via `options.context` to vjsf — no separate composable is needed just to inject `getProps`/`getItems`.
- **`zodToJsonSchema` in components** — always expose two separate computeds: `schema` (the Zod schema, used for `StyledEditFormDialogErrorIcon` validation) and `jsonSchema` (passed to vjsf). Derive `jsonSchema` from `schema.value` — do NOT call `takeOne` twice. Never create a precomputed JSON schema map file; the `*TypeFormSchemaMap` is the source of truth.
  ```typescript
  // WRONG — unnecessary intermediate JSON schema map file
  export const ColumnTypeJsonSchemaMap = {
    [ColumnType.String]: zodToJsonSchema(ColumnTypeFormSchemaMap[ColumnType.String]),
  };
  // WRONG — calls takeOne twice instead of reusing schema.value
  const schema = computed(() => takeOne(ColumnTypeFormSchemaMap, columnType.value));
  const jsonSchema = computed(() => zodToJsonSchema(takeOne(ColumnTypeFormSchemaMap, columnType.value)));
  // CORRECT — schema.value reused for jsonSchema
  const schema = computed(() => takeOne(ColumnTypeFormSchemaMap, columnType.value));
  const jsonSchema = computed(() => zodToJsonSchema(schema.value));
  ```
  In edit dialogs where the type comes from a prop (not a ref), use the prop field directly:
  ```typescript
  const schema = computed(() => takeOne(ColumnTypeFormSchemaMap, column.type));
  const jsonSchema = computed(() => zodToJsonSchema(schema.value));
  ```
- **`satisfies z.ZodType<T>` with class types** — when a schema output has plain objects but the interface uses class instances (with `toJSON`), use `Except` + `ToData` in the satisfies to strip `toJSON` from nested classes:
  ```typescript
  export const dataSourceSchema = z.object({...})
    satisfies z.ZodType<Except<DataSource, "columns"> & { columns: ToData<Column>[] }>;
  ```
