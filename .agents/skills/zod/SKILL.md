---
name: zod
description: Esposter Zod schema conventions — z namespace imports, no optional+default combos, generic schemas with create* functions, vjsf form schemas, and satisfies with ToData for class types. Apply when writing Zod schemas.
---

# Zod Conventions

## String Normalization — Always Use `.transform().pipe()`

When normalizing a string field (trimming, lowercasing, etc.) before further validation, always use `.transform(fn).pipe(refinedSchema)`. Never use `.overwrite()` — `.transform().pipe()` is the consistent pattern across the codebase:

```typescript
// CORRECT
z.string().transform(normalizeString).pipe(z.string().min(1).max(MAX));
z.string()
  .transform((v) => normalizeString(v).toLowerCase())
  .pipe(z.string().min(1).max(MAX));

// WRONG — .overwrite() is inconsistent with the rest of the codebase
z.string().overwrite(normalizeString).min(1);
```

The shared helpers `createNormalizedStringSchema(maxLength)` and `createNameSchema(maxLength)` in `@esposter/db-schema` follow this pattern and should be used for standard name/text fields.

### `.pipe()` chaining and `z.toJSONSchema` — never nest pipes when JSON schema output matters

`z.toJSONSchema` (and `zodToJsonSchema`) runs with `io = "output"` by default. For any `ZodPipe(A, B)`, it uses `B` (the output schema) for JSON schema generation. **Constraints on `A` are silently dropped.** This becomes a bug when you chain `.pipe()` calls:

```typescript
// BUG — maxLength is on an intermediate pipe output (A), never reaches the JSON schema
const schema = createNormalizedStringSchema(maxLength, base).pipe(z.string().min(1));
// z.toJSONSchema sees only z.string().min(1) → { minLength: 1 }  ← maxLength missing!

// CORRECT — all constraints on the single outermost output
const schema = base.transform(normalizeString).pipe(z.string().min(1).max(maxLength));
// z.toJSONSchema sees z.string().min(1).max(maxLength) → { minLength: 1, maxLength: N } ✓
```

**Rule**: when a `.transform().pipe()` schema is itself passed to another `.pipe()`, the intermediate output constraints are invisible to `z.toJSONSchema`. Always consolidate all string constraints (`min`, `max`, `regex`, etc.) on the **single final `.pipe()` output**, not spread across intermediate layers.

This was the root cause of `name` missing `maxLength` in the `ColumnForm` JSON schema — `createNameSchema` was doing `createNormalizedStringSchema(maxLength).pipe(z.string().min(1))`, nesting three pipe layers and losing `max`.

## Arrays — Always Use `createUniqueArraySchema`

**Never call `.array()` directly** unless duplicates are genuinely valid for that field. Always use `createUniqueArraySchema(schema)` from `@esposter/shared` instead. It wraps `.array()` with a uniqueness refine so duplicate items are rejected at the Zod boundary:

```typescript
// WRONG — bare .array() skips uniqueness enforcement
z.string().array().max(MAX_READ_LIMIT);

// CORRECT
createUniqueArraySchema(z.string()).max(MAX_READ_LIMIT);
```

All chaining (`.min()`, `.max()`, `.nullable()`, `.optional()`, `.default()`) works identically after `createUniqueArraySchema` — Zod 4's `.refine()` returns the same `ZodArray` type, preserving the full method surface.

For object arrays, always pass the field name that uniquely identifies each item as the second argument:

```typescript
createUniqueArraySchema(fileEntitySchema, "id").max(FILE_MAX_LENGTH).default([]);
createUniqueArraySchema(embedFieldSchema, "name").max(25).optional();
createUniqueArraySchema(createSortItemSchema(sortKeySchema), "key").min(0).default([]);
```

TypeScript infers `T` from the schema argument, so `key` is automatically constrained to the schema's keys — passing a non-existent property name is a type error. For Zod 4, prefer deriving object-schema keys from `z.ZodObject["shape"]` instead of from `keyof z.output<TSchema>`; Zod's output type can expand into unresolved mapped internals in generic factories like `createSortItemSchema(sortKeySchema)`.

When maintaining `createUniqueArraySchema`, keep the keyed and keyless call signatures as an intersection function type rather than an overload interface if `typescript/unified-signatures` pushes to merge them. Merging the keyed/keyless forms into one optional conditional parameter can break generic callers such as `createTableEditorSchema(schema, "id")` and `createUniqueArraySchema(createSortItemSchema(sortKeySchema), "key")`. The keyed signature still needs to support non-`ZodObject` object-output schemas, such as discriminated unions, by falling back to output keys.

**Exception — duplicates are valid**: Use plain `.array()` when the array semantically allows duplicate items (e.g. `handleElementSchema` — positional DOM bounds on a node, `effectSchema` — same effect config at different values, `embedSchema` — ordered content blocks). Do not use `createUniqueArraySchema` for these; do not add an artificial `id` field just to force uniqueness.

## External Event / Boundary Payloads — Validate, Never Cast

Data arriving from an external system at runtime (EventGrid `event.data`, Storage Queue messages, webhook bodies) is untyped. **Never** assert its shape with `event.data as unknown as SomeType` — a malformed payload then throws deep in the handler when a field is accessed. Always define a co-located Zod schema for the payload interface and `.parse()` it.

```typescript
// WRONG — unsafe cast, no runtime validation
const data = event.data as unknown as PushNotificationEventGridData;

// CORRECT — co-locate the schema next to the interface, parse at the boundary
export interface PushNotificationEventGridData {
  message: Pick<MessageEntity, "message" | "partitionKey" | "rowKey" | "userId">;
  notificationOptions: { icon?: null | string; title?: null | string };
}
export const pushNotificationEventGridDataSchema = z.object({
  message: standardMessageEntitySchema.pick({ message: true, partitionKey: true, rowKey: true, userId: true }),
  notificationOptions: z.object({ icon: z.string().nullish(), title: z.string().nullish() }),
}) satisfies z.ZodType<PushNotificationEventGridData>;
```

**Rules:**

- **Co-locate the schema with the interface** — `*EventGridDataSchema` in the same file as `*EventGridData`, `satisfies z.ZodType<TheInterface>`. After adding an export to a `@esposter/db-schema` file, run `pnpm export:gen` so the barrel re-exports it, and `pnpm build` so dependents (e.g. `azure-functions`) resolve it from `dist`.
- **Compose from existing schemas** — build the payload schema from the schemas of its parts: `.pick()` from `standardMessageEntitySchema` / `selectWebhookInMessageSchema`, reuse `webhookPayloadSchema`. Never hand-rewrite field validators that already exist.
- **`.parse()` inside `getResultAsync`** — put the parse call as the first line inside the handler's `getResultAsync(async () => { ... })` body (matching `processScheduledMessageJobHandler`), so a validation failure flows through the neverthrow `.match(noop, (error) => { context.error(...); throw error; })` path instead of throwing synchronously outside it. Let the parsed value's inferred type flow downstream — drop the now-redundant `import type { *EventGridData }`.
- **`.nullish()` is allowed here** — the app-owned `.nullable()` ban does not apply at the external boundary. EventGrid `notificationOptions` fields are `null | string`, so `z.string().nullish()` (matching `icon?: null | string`) is correct.
- **Cross-package schemas need an explicit type annotation** — under `--isolatedDeclarations` (enabled for `packages/*` library packages), a `satisfies z.ZodType<T>` schema composed from **another package's** imported schemas (e.g. `webhookEventGridDataSchema` in `azure-functions` built from `@esposter/db-schema`'s `webhookPayloadSchema` / `selectWebhookInMessageSchema.pick(...)`) fails declaration emit with TS9010/TS9013 — the imported types can't be re-inferred. Annotate the export instead and drop `satisfies`: `export const webhookEventGridDataSchema: z.ZodType<WebhookEventGridData> = z.object({...});`. Schemas composed from **same-package** locals keep the normal `satisfies z.ZodType<T>` form (their types resolve within the project).

## Imports

Always use the `z` namespace export: `z.ZodType`, `z.ZodError`, etc. Never use named imports like `import type { ZodType }`.

## Zod 4 Shorthand APIs

**Never use the old chained syntax** — Zod 4 promotes string format validators and numeric refinements to standalone top-level functions:

| Use (Zod 4)             | Never use (Zod 3 legacy)           |
| ----------------------- | ---------------------------------- |
| `z.email()`             | `z.string().email()`               |
| `z.url()`               | `z.string().url()`                 |
| `z.uuid()`              | `z.string().uuid()`                |
| `z.nanoid()`            | `z.string().nanoid()`              |
| `z.cuid()`              | `z.string().cuid()`                |
| `z.cuid2()`             | `z.string().cuid2()`               |
| `z.ulid()`              | `z.string().ulid()`                |
| `z.emoji()`             | `z.string().emoji()`               |
| `z.base64()`            | `z.string().base64()`              |
| `z.base64url()`         | `z.string().base64url()`           |
| `z.ipv4()`              | `z.string().ip({ version: "v4" })` |
| `z.ipv6()`              | `z.string().ip({ version: "v6" })` |
| `z.int()`               | `z.number().int()`                 |
| `z.iso.date()`          | `z.string().date()`                |
| `z.iso.datetime()`      | `z.string().datetime()`            |
| `z.iso.time()`          | `z.string().time()`                |
| `z.iso.duration()`      | `z.string().duration()`            |
| `z.strictObject({...})` | `z.object({...}).strict()`         |
| `z.looseObject({...})`  | `z.object({...}).passthrough()`    |

Note: `z.uuid()` now strictly validates RFC 9562/4122. Use `z.guid()` for permissive "UUID-like" validation.

## ZodError Issue Mutation

**Never call `.addIssue()` or `.addIssues()` on a `ZodError`** — these methods are deprecated in Zod 4. Push directly to the issues array:

```typescript
// WRONG
myError.addIssue({ code: "custom", message: "..." });

// CORRECT
myError.issues.push({ code: "custom", message: "..." });
```

`ctx.addIssue()` inside `superRefine` is still valid (it operates on the refinement context, not a `ZodError` instance).

## Schema Rules

- **Minimal strict input schemas** — model the exact case being implemented now. Prefer required fields over optional fields plus `.refine()` when there is only one supported flow. Split future variants into separate schemas/procedures later instead of accepting broad optional shapes early. Use `.refine()` only for cross-field rules that cannot be represented structurally.
- **`z.enum` with native enums (Zod 4)** — use `z.enum(MyEnum)` directly for TypeScript string enums; `z.nativeEnum` is Zod 3 only.
- **Non-negative integers** — use `.nonnegative()` instead of `.min(0)` for fields that must be ≥ 0 (e.g. `position`, `sheetIndex`). Reserve `.min(N)` for ranges where N > 0 or where the intent is a specific lower bound alongside an upper bound.
- **Schema must match its type exactly** — if a field's TypeScript type is `ColumnFormat`, use `columnFormatSchema` (defined alongside `ColumnFormat`), never inline the equivalent union `z.union([booleanFormatSchema, dateFormatSchema, numberFormatSchema])`. Every named type must have exactly one named schema; never reconstruct a union inline when a schema for that union already exists or should exist.
- **`.default()`** — do not combine `.optional().default(value)`; `.default()` already handles `undefined` input, so `.optional()` is redundant. More importantly: **only use `.default()` in schemas whose TypeScript type is a class with actual property defaults** (e.g. `class Foo { bar = [] }`). Never add `.default()` to schemas that `satisfies z.ZodType<Interface>` — interfaces have no defaults, so the schema and the type would be misaligned. If a field should start empty, initialise it explicitly at the call site (e.g. `new MyClass()` or `{ steps: [] }`).
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
- **`ColumnTransformationType` enum values** — use short descriptive names matching the transformation domain (e.g. `Aggregation`, `ConvertTo`, `DatePart`, `Math`, `RegexMatch`, `String`). These are distinct from the interface names (e.g. `AggregationTransformation` interface → `ColumnTransformationType.Aggregation`).
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
  export const datePartTransformationSchema = z
    .object({ ... })
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

- **Shared ID field schemas** — always use named ID schemas for object fields that match their canonical name:
  - If the entire schema is just an ID field, use the schema directly: `const onUpdateSchema = roomIdSchema` not `z.object({ roomId: selectRoomInMessageSchema.shape.id })`
  - For multi-field objects, spread the shape: `z.object({ ...roomIdSchema.shape, ...userIdSchema.shape, otherField: ... })`, never `z.object({ roomId: selectRoomInMessageSchema.shape.id })`
  - For constrained variants (e.g. adding `.min(1)` to `userIds`), chain from the shape field: `userIds: userIdsSchema.shape.userIds.min(1)` — not `selectUserSchema.shape.id.array().min(1).max(MAX_READ_LIMIT)`
  - Named schemas: `roomIdSchema`, `userIdSchema`, `userIdsSchema` (all from `@esposter/db-schema`). For differently-named fields like `targetUserId` or `actorUserId`, use `selectUserSchema.shape.id` directly.

- **Record maps over switch statements** — when a switch on an enum drives different async operations, prefer `const actionMap: Record<EnumType, (args) => Promise<void>> = { [Enum.A]: ..., [Enum.B]: ... }` and call `await actionMap[type](args)`. Exhaustiveness is enforced by the Record key type; no `default: exhaustiveGuard(type)` needed.

- **Paginated endpoint schemas** — never define `limit` and `cursor` manually on paginated input schemas. Always use `createCursorPaginationParamsSchema` (Azure Table / any cursor-based endpoint) or `createBasePaginationParamsSchema` (non-cursor). When the sort order is fixed in the implementation, omit `sortBy` from the schema: `createCursorPaginationParamsSchema(z.string(), []).omit({ sortBy: true })`. The function bakes in the correct `DEFAULT_READ_LIMIT`, `MAX_READ_LIMIT`, and `cursor: z.string().optional()` — never override these manually. On the server side, wire cursor into `getCursorWhereAzureTable` (Azure Table) or `getCursorWhere` (Postgres), fetch `limit + 1` rows, and return `getCursorPaginationData(items, limit, sortBy)`:

  ```typescript
  // WRONG — manual limit/cursor definition
  const readModerationLogsInputSchema = z.object({
    cursor: z.string().optional(),
    limit: z.int().min(1).max(MAX_READ_LIMIT).default(50),
  });

  // CORRECT — use the shared factory
  const readModerationLogsInputSchema = z.object({
    ...createCursorPaginationParamsSchema(z.string(), []).omit({ sortBy: true }).shape,
  });
  // Query impl:
  const sortBy: SortItem<keyof ModerationLogEntity>[] = [MESSAGE_ROWKEY_SORT_ITEM];
  if (cursor) clauses.push(...getCursorWhereAzureTable(cursor, sortBy));
  const items = await getTopNEntities(client, limit + 1, ModerationLogEntity, { filter: serializeClauses(clauses) });
  return getCursorPaginationData(items, limit, sortBy);
  ```

- **`refineAtLeastOne`** — when an update/patch schema has all-optional fields and at least one must be provided, always use `refineAtLeastOne(schema, ["field1", "field2", ...])` from `#shared/services/zod/refineAtLeastOne`. Never inline `.refine((data) => ...)` for this pattern:

  ```typescript
  import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
  export const updateFooInputSchema = refineAtLeastOne(
    z.object({ id: ..., name: z.string().optional(), color: z.string().optional() }),
    ["name", "color"],
  );
  ```

- **`satisfies z.ZodType<T>` with class types** — when a schema output has plain objects but the interface uses class instances (with `toJSON`), use `Except` + `ToData` in the satisfies to strip `toJSON` from nested classes:
  ```typescript
  export const dataSourceSchema = z.object({...})
    satisfies z.ZodType<Except<DataSource, "columns"> & { columns: ToData<Column>[] }>;
  ```
