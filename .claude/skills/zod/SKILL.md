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
- **Vjsf discriminated union variant titles** — every variant in a `z.discriminatedUnion` that will be rendered by Vjsf must have `.meta({ title: ... })` on the variant object (not just on individual fields). Without it, Vjsf shows "Option 1", "Option 2", etc. Title values are run through `toTitleCase(prettify(...))` automatically in `zodToJsonSchema`, so use enum values directly:

  ```typescript
  export const columnTransformationSchema = z.discriminatedUnion("type", [
    convertToTransformationSchema.meta({ title: ColumnTransformationType.ConvertTo }),
    datePartTransformationSchema.meta({ title: ColumnTransformationType.DatePart }),
  ]);
  // OR: set .meta({ title }) on the schema at definition time (preferred):
  export const datePartTransformationSchema = withSourceColumnIdSchema
    .extend({ ... })
    .meta({ title: ColumnTransformationType.DatePart }); // ← on the variant schema itself
  ```

- **Vjsf discriminated union type discriminant** — the `type` field used as the discriminant behaves differently depending on how it's typed:
  - `z.literal(ColumnType.Computed).readonly()` — Vjsf reads `const: "Computed"` from JSON schema and automatically sets `type = "Computed"` when switching to that variant, AND auto-detects the active variant when pre-populating a form. ✓ **Always add `.readonly()` to literal discriminants in form schemas.**
  - `z.literal(ColumnType.Computed)` (no `.readonly()`) — **BROKEN for auto-detection**: Vjsf cannot pre-select the correct variant when editing existing data. The blank variant selector appears. **Never omit `.readonly()` from a literal discriminant in a form schema.**
  - `z.enum([ColumnType.Boolean, ColumnType.Number, ColumnType.String])` (no `.readonly()`) — Vjsf renders a select input for the field. When switching to this variant, Vjsf uses the first enum value as default. ✓
  - `z.enum([...]).readonly()` — **BROKEN**: the field has `readOnly: true` in JSON schema but no `const`, so Vjsf cannot determine what value to set when switching to this variant. The old discriminant value persists. **Never use `.readonly()` on an enum discriminant field.**

- **Vjsf `getItems` filtering by column type** — when a `sourceColumnId` or `sourceColumnIds` field should only show columns of specific types, override `getItems` in the `.extend()` call to reference a pre-filtered context key. Do not use the generic `context.sourceColumnItems` for type-restricted fields:

  ```typescript
  // In the transformation schema — override sourceColumnId.getItems:
  export const datePartTransformationSchema = withSourceColumnIdSchema
    .extend({
      sourceColumnId: withSourceColumnIdSchema.shape.sourceColumnId.meta({
        getItems: "context.dateSourceColumnItems", // only Date columns
      }),
      part: z.enum(DatePartType).meta({ title: "Part" }),
      type: z.literal(ColumnTransformationType.DatePart),
    })
    .meta({ applicableColumnTypes: [ColumnType.Date], title: ColumnTransformationType.DatePart });

  // In the Vue component — pass pre-filtered lists in options.context:
  const options = computed((): Options & { context: ColumnFormVjsfContext } => ({
    context: {
      sourceColumnItems: dataSource.columns.map(({ id, name }) => ({ title: name, value: id })),
      dateSourceColumnItems: dataSource.columns
        .filter(({ type }) => type === ColumnType.Date)
        .map(({ id, name }) => ({ title: name, value: id })),
      numberSourceColumnItems: dataSource.columns
        .filter(({ type }) => type === ColumnType.Number)
        .map(({ id, name }) => ({ title: name, value: id })),
      stringSourceColumnItems: dataSource.columns
        .filter(({ type }) => type === ColumnType.String)
        .map(({ id, name }) => ({ title: name, value: id })),
    },
  }));
  ```

  The `.meta({ getItems: "..." })` call on an existing field merges with existing meta (preserving `comp` and `title`) — only `getItems` is overridden.

  `getItems` is a JS expression string, so spread syntax works for multiple types: `"[...context.dateSourceColumnItems, ...context.numberSourceColumnItems]"`.

- **vjsf `.meta()` layout properties** — put `comp`, `getProps`, and `getItems` directly on the field's `.meta()` in the schema definition. Do not inject them dynamically via `schema.extend()` in a composable. `GlobalMeta` for these is typed as `string` — they are vjsf JavaScript expression strings evaluated at runtime against the vjsf `context` (passed via `:options`). Example:

  ```typescript
  name: z.string().meta({
    getProps: `{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Already exists'] }`,
    title: "Name",
  }),
  sourceColumnId: z.string().meta({ comp: "select", getItems: "context.sourceColumnItems", title: "Source Column" }),
  ```

  Components pass the runtime data via `options.context` to vjsf — no separate composable is needed just to inject `getProps`/`getItems`.

- **`zodToJsonSchema` in components** — always expose two separate computeds: `schema` (the Zod schema, used for form validation) and `jsonSchema` (passed to vjsf). Derive `jsonSchema` from `schema.value`. Never create a precomputed JSON schema map file; the `*TypeFormSchemaMap` is the source of truth.

  ```typescript
  // WRONG — unnecessary intermediate JSON schema map file
  export const ColumnTypeJsonSchemaMap = {
    [ColumnType.String]: zodToJsonSchema(ColumnTypeFormSchemaMap[ColumnType.String]),
  };
  // CORRECT — schema.value reused for jsonSchema
  const schema = computed(() => ColumnTypeFormSchemaMap[columnType.value]);
  const jsonSchema = computed(() => zodToJsonSchema(schema.value));
  ```

- **Vjsf options typing** — type the `options` computed as `VjsfOptions<ContextType>` where `VjsfOptions` is from `app/models/vjsf/VjsfOptions.ts` and the context interface lives in `app/models/<feature>/ContextInterface.ts` (one interface per file, reusable across create/edit dialogs for the same form):

  ```typescript
  import type { ColumnFormVjsfContext } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
  import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";
  import { Vjsf } from "@koumoul/vjsf";

  const options = computed<VjsfOptions<ColumnFormVjsfContext>>(() => ({
    context: { columnNames: ..., currentName: ..., ... },
  }));
  ```

- **Vjsf discriminated union — auto-detection limitation**: Vjsf can only auto-detect which `oneOf` variant matches the current value when the discriminant property has a single `const` value (e.g. `z.literal(ColumnType.Date).readonly()`). `z.enum([...])` or `z.union([z.literal(...), ...])` on the discriminant do NOT produce a single `const` — Vjsf cannot determine the variant and shows a blank variant selector instead of pre-filling the form. **Do not use a discriminated union schema for forms where the variant must be pre-selected from existing data.** Instead, use a `*TypeFormSchemaMap` (a `Record<EnumType, z.ZodType>`) and select the schema per entry at the call site:

  ```typescript
  // shared/models/.../ColumnTypeFormSchemaMap.ts
  export const ColumnTypeFormSchemaMap = {
    [ColumnType.Boolean]: columnFormSchema,
    [ColumnType.Computed]: computedColumnFormSchema,
    [ColumnType.Date]: dateColumnFormSchema,
    [ColumnType.Number]: columnFormSchema,
    [ColumnType.String]: columnFormSchema,
  };

  // In edit dialog — schema driven by the column's own type (ref initialized from prop):
  const columnType = ref(column.type);
  const schema = computed(() => ColumnTypeFormSchemaMap[columnType.value]);
  const jsonSchema = computed(() => zodToJsonSchema(schema.value));
  // Type selector in template — changing type resets the form inline (structuredClone required: Vjsf needs plain objects):
  // @update:model-value="editedColumn = structuredClone(ColumnTypeCreateMap[$event].create())"

  // In create dialog — schema driven by a columnType ref (starts at ColumnType.String):
  const columnType = ref(ColumnType.String);
  const schema = computed(() => ColumnTypeFormSchemaMap[columnType.value]);
  const jsonSchema = computed(() => zodToJsonSchema(schema.value));
  // Type selector in template — changing type calls resetForm():
  // @update:model-value="resetForm()"
  ```

  The selector items are defined in `*ItemCategoryDefinitions.ts` (e.g. `ColumnTypeItemCategoryDefinitions`) mapping display names to canonical enum values:

  ```typescript
  export const ColumnTypeItemCategoryDefinitions: SelectItemCategoryDefinition<ColumnType>[] = [
    { title: "Standard", value: ColumnType.String },
    { title: ColumnType.Date, value: ColumnType.Date },
    { title: ColumnType.Computed, value: ColumnType.Computed },
  ];
  ```

  Factory defaults come from `*TypeCreateMap` (e.g. `ColumnTypeCreateMap`) which accepts `Except<Partial<SpecificType>, "type">` as init and pins the `type`:

  ```typescript
  export const ColumnTypeCreateMap = {
    [ColumnType.String]: {
      create: (init?: Except<Partial<Column<ColumnType.String>>, "type">) =>
        new Column({ ...init, type: ColumnType.String }),
    },
    [ColumnType.Date]: {
      create: (init?: Except<Partial<DateColumn>, "type">) => new DateColumn({ ...init }),
    },
    // ...
  } as const satisfies Record<
    ColumnType,
    { create: (init?: Except<Partial<Column>, "type">) => DataSource["columns"][number] }
  >;
  ```

- **Snapshot tests for vjsf schemas** — for schemas passed to `zodToJsonSchema()` and rendered by Vjsf, add a `toMatchInlineSnapshot()` test co-located next to the schema file (same folder, same base name). Run `pnpm vitest run --update` to fill the snapshot.

  ```typescript
  import { dateColumnFormSchema } from "#shared/models/tableEditor/file/column/DateColumn";
  import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
  import { describe, expect, test } from "vitest";

  describe("DateColumn", () => {
    test("produces correct json schema for vjsf", () => {
      expect.hasAssertions();
      expect(zodToJsonSchema(dateColumnFormSchema)).toMatchInlineSnapshot();
    });
  });
  ```

- **`satisfies z.ZodType<T>` with class types** — when a schema output has plain objects but the interface uses class instances (with `toJSON`), use `Except` + `ToData` in the satisfies to strip `toJSON` from nested classes:
  ```typescript
  export const dataSourceSchema = z.object({...})
    satisfies z.ZodType<Except<DataSource, "columns"> & { columns: ToData<Column>[] }>;
  ```
