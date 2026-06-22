---
name: zod
description: Esposter Zod schema conventions — z namespace imports, no optional+default combos, generic schemas with create* functions, vjsf form schemas, and satisfies with ToData for class types. Apply when writing Zod schemas.
---

# Zod Conventions

## String Normalization — Always Use `.transform().pipe()`

When normalizing a string (trim, lowercase, etc.) before further validation, use `.transform(fn).pipe(refinedSchema)`. Never `.overwrite()` — inconsistent with the codebase.

```typescript
z.string().transform(normalizeString).pipe(z.string().min(1).max(MAX));
z.string()
  .transform((v) => normalizeString(v).toLowerCase())
  .pipe(z.string().min(1).max(MAX));
```

Use the shared helpers for standard name/text fields: `createNormalizedStringSchema(maxLength)` from `@esposter/shared` and `createNameSchema(maxLength)` from `@esposter/db-schema`.

### Never nest pipes when JSON schema output matters

`z.toJSONSchema` / `zodToJsonSchema` run with `io = "output"`: for any `ZodPipe(A, B)` they use `B` (the output) and **silently drop constraints on `A`**. Chaining `.pipe()` calls hides intermediate constraints.

```typescript
// BUG — maxLength is on an intermediate pipe output, never reaches the JSON schema
const schema = createNormalizedStringSchema(maxLength, base).pipe(z.string().min(1));
// → { minLength: 1 }  ← maxLength missing!

// CORRECT — all constraints on the single outermost output
const schema = base.transform(normalizeString).pipe(z.string().min(1).max(maxLength));
// → { minLength: 1, maxLength: N } ✓
```

**Rule:** consolidate all string constraints (`min`, `max`, `regex`, etc.) on the **single final `.pipe()` output**, never spread across layers. (Root cause of `name` missing `maxLength` in `ColumnForm` — `createNameSchema` nested three pipe layers and lost `max`.)

## Arrays — Always Use `createUniqueArraySchema`

**Never call `.array()` directly** unless duplicates are genuinely valid. Use `createUniqueArraySchema(schema)` from `@esposter/shared` — it wraps `.array()` with a uniqueness refine.

```typescript
createUniqueArraySchema(z.string()).max(MAX_READ_LIMIT); // not z.string().array()
```

All chaining (`.min()`, `.max()`, `.nullable()`, `.optional()`, `.default()`) works identically after — Zod 4's `.refine()` returns the same `ZodArray` type.

For object arrays, pass the uniquely-identifying field name as the second argument:

```typescript
createUniqueArraySchema(fileEntitySchema, "id").max(FILE_MAX_LENGTH).default([]);
createUniqueArraySchema(createSortItemSchema(sortKeySchema), "key").min(0).default([]);
```

TS infers `T` from the schema, so a non-existent key is a type error. In Zod 4, derive object-schema keys from `z.ZodObject["shape"]` rather than `keyof z.output<TSchema>` — output types can expand into unresolved mapped internals in generic factories. When maintaining `createUniqueArraySchema`, keep keyed/keyless signatures as an **intersection function type**, not an overload interface, if `typescript/unified-signatures` pushes to merge them — merging into one optional conditional parameter breaks generic callers like `createTableEditorSchema(schema, "id")`. The keyed signature must still support non-`ZodObject` object-output schemas (e.g. discriminated unions) by falling back to output keys.

**Exception — duplicates are valid:** use plain `.array()` when the array semantically allows duplicates (`handleElementSchema` — positional DOM bounds; `effectSchema` — same config at different values; `embedSchema` — ordered content blocks). Don't add an artificial `id` field just to force uniqueness.

## External Event / Boundary Payloads — Validate, Never Cast

Runtime data from external systems (EventGrid `event.data`, Storage Queue messages, webhook bodies) is untyped. **Never** assert with `event.data as unknown as SomeType` — a malformed payload throws deep in the handler. Define a co-located Zod schema and `.parse()` at the boundary.

```typescript
// schema co-located next to the interface, parsed at the boundary — never `event.data as unknown as T`
export interface PushNotificationEventGridData {
  message: Pick<MessageEntity, "message" | "partitionKey" | "rowKey" | "userId">;
  notificationOptions: { icon?: null | string; title?: null | string };
}
export const pushNotificationEventGridDataSchema = z.object({
  message: standardMessageEntitySchema.pick({ message: true, partitionKey: true, rowKey: true, userId: true }),
  notificationOptions: z.object({ icon: z.string().nullish(), title: z.string().nullish() }),
}) satisfies z.ZodType<PushNotificationEventGridData>;
```

Rules:

- **Co-locate the schema with the interface** — `*EventGridDataSchema` in the same file as `*EventGridData`, `satisfies z.ZodType<TheInterface>`. After adding an export to a `@esposter/db-schema` file, run `pnpm export:gen` (barrel) and `pnpm build` (so dependents like `azure-functions` resolve it from `dist`).
- **Compose from existing schemas** — `.pick()` from `standardMessageEntitySchema` / `selectWebhookInMessageSchema`, reuse `webhookPayloadSchema`. Never hand-rewrite existing field validators.
- **`.parse()` as the first line inside `getResultAsync(async () => { ... })`** (matching `processScheduledMessageJobHandler`) so a validation failure flows through the neverthrow `.match(noop, (error) => { context.error(...); throw error; })` path instead of throwing synchronously outside it. Let the parsed value's inferred type flow downstream — drop the redundant `import type { *EventGridData }`.
- **`.nullish()` is allowed here** — the app-owned `.nullable()` ban doesn't apply at the external boundary. EventGrid `notificationOptions` fields are `null | string`, so `z.string().nullish()` is correct.
- **Cross-package schemas need an explicit type annotation** — under `--isolatedDeclarations` (enabled for `packages/*` libraries), a `satisfies z.ZodType<T>` composed from **another package's** imported schemas fails declaration emit (TS9010/TS9013) — imported types can't be re-inferred. Annotate the export and drop `satisfies`: `export const webhookEventGridDataSchema: z.ZodType<WebhookEventGridData> = z.object({...});`. Schemas composed from **same-package** locals keep the normal `satisfies z.ZodType<T>` form.

## Imports

Always use the `z` namespace export: `z.ZodType`, `z.ZodError`. Never named imports like `import type { ZodType }`.

## Zod 4 Shorthand APIs

**Never use the old chained syntax** — Zod 4 promotes format validators and numeric refinements to top-level functions:

| Use (Zod 4)                    | Never use (Zod 3 legacy)                |
| ------------------------------ | --------------------------------------- |
| `z.email()`                    | `z.string().email()`                    |
| `z.url()`                      | `z.string().url()`                      |
| `z.uuid()`                     | `z.string().uuid()`                     |
| `z.nanoid()`                   | `z.string().nanoid()`                   |
| `z.cuid()` / `z.cuid2()`       | `z.string().cuid()` / `.cuid2()`        |
| `z.ulid()`                     | `z.string().ulid()`                     |
| `z.emoji()`                    | `z.string().emoji()`                    |
| `z.base64()` / `z.base64url()` | `z.string().base64()` / `.base64url()`  |
| `z.ipv4()` / `z.ipv6()`        | `z.string().ip({ version: "v4"/"v6" })` |
| `z.int()`                      | `z.number().int()`                      |
| `z.iso.date()`                 | `z.string().date()`                     |
| `z.iso.datetime()`             | `z.string().datetime()`                 |
| `z.iso.time()`                 | `z.string().time()`                     |
| `z.iso.duration()`             | `z.string().duration()`                 |
| `z.strictObject({...})`        | `z.object({...}).strict()`              |
| `z.looseObject({...})`         | `z.object({...}).passthrough()`         |

`z.uuid()` now strictly validates RFC 9562/4122. Use `z.guid()` for permissive "UUID-like" validation.

## ZodError Issue Mutation

**Never call `.addIssue()` / `.addIssues()` on a `ZodError`** — deprecated in Zod 4. Push directly:

```typescript
myError.issues.push({ code: "custom", message: "..." }); // not myError.addIssue(...)
```

`ctx.addIssue()` inside `superRefine` is still valid (it operates on the refinement context, not a `ZodError`).

## Schema Rules

- **Minimal strict input schemas** — model the exact case being implemented now. Prefer required fields over optional + `.refine()` when only one flow is supported; split future variants into separate schemas/procedures later. Use `.refine()` only for cross-field rules that can't be represented structurally.
- **`z.enum` with native enums (Zod 4)** — use `z.enum(MyEnum)` directly for TS string enums; `z.nativeEnum` is Zod 3 only.
- **Non-negative integers** — use `.nonnegative()` not `.min(0)` for fields that must be ≥ 0 (`position`, `sheetIndex`). Reserve `.min(N)` for N > 0 or a specific lower bound paired with an upper.
- **Schema must match its type exactly** — if a field is `ColumnFormat`, use `columnFormatSchema`, never inline `z.union([booleanFormatSchema, ...])`. Every named type has exactly one named schema; never reconstruct a union inline.
- **`.default()`** — never combine `.optional().default(value)` (`.default()` already handles `undefined`). Only use `.default()` in schemas whose TS type is a **class with actual property defaults** (e.g. `class Foo { bar = [] }`). Never add `.default()` to a schema that `satisfies z.ZodType<Interface>` — interfaces have no defaults, so schema and type would misalign. Initialise empties explicitly at the call site (`new MyClass()` or `{ steps: [] }`).
- **Generic schemas** — when an abstract class has a generic type param (e.g. `ADataSourceItem<TType, TConfig>`), its schema must be generic too: export a `create*Schema` function taking typed zod schemas as params. Never hardcode type-specific values in a base schema. Use `T` for one param, descriptive `T*` (`TType`, `TConfiguration`) for multiple:

  ```typescript
  // generic function, concrete schemas passed by callers (never hardcode type-specific values in a base schema)
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

  For the union used by parent models, create a separate `*ItemSchema.ts` using `z.discriminatedUnion`. Adding a new type = add its schema to the union array:

  ```typescript
  export const dataSourceItemSchema = z.discriminatedUnion("type", [csvDataSourceItemSchema]);
  ```

- **vjsf form schemas** — never pass a full entity schema containing `z.date()` fields to `zodToJsonSchema()` — vjsf throws. Create a separate `*FormSchema` co-located in the same file via `.pick().extend()` to add `.meta()` titles, picking only user-editable fields (no `id`/`createdAt`/`updatedAt`).
- **`ColumnTransformationType` enum values** — short descriptive names matching the domain (`Aggregation`, `ConvertTo`, `DatePart`, `Math`, `RegexMatch`, `String`), distinct from interface names (`AggregationTransformation` → `ColumnTransformationType.Aggregation`).
- **`.meta({ title })` values** — use enum values directly, not string literals; `zodToJsonSchema` runs `toTitleCase(prettify(...))` automatically, so `ColumnTransformationType.ConvertTo` renders as `"Convert To"`. Always prefer `meta({ title: ColumnTransformationType.X })`.
- **`.meta({ applicableColumnTypes })`** — when a transformation applies only to certain source column types, declare `applicableColumnTypes: ColumnType[]`. Typed via `GlobalMeta extends Partial<WithApplicableColumnTypes>` in `shared/types/zod.d.ts`; the UI filters source column dropdowns by it. No `applicableColumnTypes` = accepts any source column type.

  ```typescript
  .meta({ applicableColumnTypes: [ColumnType.Date], title: ColumnTransformationType.DatePart })
  ```

- **Vjsf discriminated union variant titles** — every variant in a Vjsf-rendered `z.discriminatedUnion` needs `.meta({ title })` on the variant object (not just fields), else Vjsf shows "Option 1", etc. Prefer setting it on the schema at definition time:

  ```typescript
  export const datePartTransformationSchema = z.object({ ... }).meta({ title: ColumnTransformationType.DatePart });
  ```

- **Vjsf discriminated union type discriminant** — behaves differently by typing:
  - `z.literal(ColumnType.Computed).readonly()` — Vjsf reads `const`, auto-sets `type` when switching variants AND auto-detects the active variant when pre-populating. ✓ **Always add `.readonly()` to literal discriminants in form schemas.**
  - `z.literal(ColumnType.Computed)` (no `.readonly()`) — **BROKEN auto-detection**: can't pre-select the variant when editing. Never omit `.readonly()`.
  - `z.enum([...])` (no `.readonly()`) — renders a select; uses the first enum value as default on switch. ✓
  - `z.enum([...]).readonly()` — **BROKEN**: `readOnly: true` but no `const`, so Vjsf can't determine the value on switch; the old value persists. **Never use `.readonly()` on an enum discriminant.**
- **Vjsf `getItems` filtering by column type** — to show only certain column types, pass the pre-filtered context key into the `createSourceColumnIdSchema(getItems)` factory (default `context.columnItems`). The factory bakes `getItems` into `layout`, so transformations just spread its `.shape`. Pass the per-type pre-filtered lists in `options.context` from the Vue component (`columnItems`, `dateColumnItems`, `numberColumnItems`, `stringColumnItems`, each `dataSource.columns.filter(...).map(({ id, name }) => ({ title: name, value: id }))`):

  ```typescript
  export const datePartTransformationSchema = z
    .object({
      ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.DatePart).readonly()).shape,
      ...createSourceColumnIdSchema(ColumnFormVjsfContextPropertyNames["context.dateColumnItems"]).shape,
      part: datePartTypeSchema,
    })
    .meta({ title: ColumnTransformationType.DatePart }) satisfies z.ZodType<DatePartTransformation>;
  ```

  `getItems` is a JS expression string, so spread works for multiple types: `"[...context.dateColumnItems, ...context.numberColumnItems]"`.

- **vjsf `.meta()` layout properties** — put `comp`, `getProps`, `getItems` under the `layout` key of the field's `.meta()` in the schema, not injected dynamically via `schema.extend()` in a composable. `GlobalMeta` (`shared/types/zod.d.ts`) types `layout?: Partial<PartialCompObject>` — its values are vjsf JS expression strings evaluated at runtime against the vjsf `context` (passed via `:options`):

  ```typescript
  name: z.string().meta({
    layout: { getProps: `{ rules: [(value) => value === context.currentName || !context.columnNames.includes(value) || 'Already exists'] }` },
    title: "Name",
  }),
  sourceColumnId: z.string().meta({ layout: { comp: "select", getItems: "context.columnItems" }, title: "Source Column" }),
  ```

- **`zodToJsonSchema` in components** — expose two computeds: `schema` (Zod, for validation) and `jsonSchema` (for vjsf), deriving `jsonSchema` from `schema.value`. Never create a precomputed JSON schema map file; the `*TypeFormSchemaMap` is the source of truth.

  ```typescript
  // schema.value reused for jsonSchema — no intermediate JSON schema map file
  const schema = computed(() => ColumnTypeFormSchemaMap[columnType.value]);
  const jsonSchema = computed(() => zodToJsonSchema(schema.value));
  ```

- **Vjsf options typing** — type the `options` computed as `VjsfOptions<ContextType>` (`VjsfOptions` from `app/models/vjsf/VjsfOptions.ts`); the context interface lives in `app/models/<feature>/ContextInterface.ts` (one per file, reusable across create/edit dialogs for the same form):

  ```typescript
  import type { ColumnFormVjsfContext } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
  import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";
  const options = computed<VjsfOptions<ColumnFormVjsfContext>>(() => ({ context: { columnNames: ..., currentName: ... } }));
  ```

- **Vjsf discriminated union — auto-detection limitation**: Vjsf only auto-detects the matching `oneOf` variant when the discriminant has a single `const` (`z.literal(...).readonly()`). `z.enum([...])` / `z.union([z.literal(...), ...])` don't produce a single `const` — Vjsf shows a blank variant selector. **Don't use a discriminated union schema for forms where the variant must pre-select from existing data.** Instead use a `*TypeFormSchemaMap` (`Record<EnumType, z.ZodType>`) and select per entry at the call site. Edit dialog inits `const columnType = ref(column.type)`; create dialog inits `ref(ColumnType.String)`. Both: `const schema = computed(() => ColumnTypeFormSchemaMap[columnType.value]); const jsonSchema = computed(() => zodToJsonSchema(schema.value))`. The type selector resets the form on change — edit dialog inline (`@update:model-value="editedColumn = structuredClone(ColumnTypeCreateMap[$event].create())"`; `structuredClone` required because Vjsf needs plain objects), create dialog `@update:model-value="resetForm()"`.

  ```typescript
  // shared/models/.../ColumnTypeFormSchemaMap.ts
  export const ColumnTypeFormSchemaMap = {
    [ColumnType.Boolean]: columnFormSchema,
    [ColumnType.Computed]: computedColumnFormSchema,
    [ColumnType.Date]: dateColumnFormSchema,
    [ColumnType.Number]: columnFormSchema,
    [ColumnType.String]: columnFormSchema,
  };
  ```

  Selector items live in `*ItemCategoryDefinitions.ts`, mapping display names to canonical enum values (`SelectItemCategoryDefinition<ColumnType>[]`, e.g. `{ title: "Standard", value: ColumnType.String }`). Factory defaults come from `*TypeCreateMap`, which accepts `Except<Partial<SpecificType>, "type">` and pins `type`:

  ```typescript
  export const ColumnTypeCreateMap = {
    [ColumnType.String]: {
      create: (init?: Except<Partial<Column<ColumnType.String>>, "type">) =>
        new Column({ ...init, type: ColumnType.String }),
    },
    [ColumnType.Date]: { create: (init?: Except<Partial<DateColumn>, "type">) => new DateColumn({ ...init }) },
    // ...
  } as const satisfies Record<
    ColumnType,
    { create: (init?: Except<Partial<Column>, "type">) => DataSource["columns"][number] }
  >;
  ```

- **Snapshot tests for vjsf schemas** — for schemas passed to `zodToJsonSchema()` and rendered by Vjsf, add a `toMatchInlineSnapshot()` test co-located next to the schema file (same folder/base name). Fill via `pnpm vitest run --update`:

  ```typescript
  describe("DateColumn", () => {
    test("produces correct json schema for vjsf", () => {
      expect.hasAssertions();
      expect(zodToJsonSchema(dateColumnFormSchema)).toMatchInlineSnapshot();
    });
  });
  ```

- **Shared ID field schemas** — always use named ID schemas for object fields matching their canonical name:
  - Whole schema is just an ID field → use the schema directly: `const onUpdateSchema = roomIdSchema`, not `z.object({ roomId: selectRoomInMessageSchema.shape.id })`.
  - Multi-field objects → spread the shape: `z.object({ ...roomIdSchema.shape, ...userIdSchema.shape, otherField: ... })`.
  - Constrained variants (e.g. adding `.min(1)` to `userIds`) → chain from the shape field: `userIds: userIdsSchema.shape.userIds.min(1)`, not `selectUserSchema.shape.id.array().min(1)...`.
  - Named schemas `roomIdSchema`, `userIdSchema`, `userIdsSchema` from `@esposter/db-schema`. For differently-named fields (`targetUserId`, `actorUserId`), use `selectUserSchema.shape.id` directly.
- **Record maps over switch statements** — when a switch on an enum drives different async operations, prefer `const actionMap: Record<EnumType, (args) => Promise<void>> = {...}` and `await actionMap[type](args)`. Exhaustiveness is enforced by the Record key type; no `exhaustiveGuard` needed.
- **Paginated endpoint schemas** — never define `limit`/`cursor` manually. Use `createCursorPaginationParamsSchema` (cursor-based) or `createBasePaginationParamsSchema` (non-cursor). When sort order is fixed, omit `sortBy`: `createCursorPaginationParamsSchema(z.string(), []).omit({ sortBy: true })`. The factory bakes in `DEFAULT_READ_LIMIT`, `MAX_READ_LIMIT`, `cursor: z.string().optional()` — never override. Server-side, wire cursor into `getCursorWhereAzureTable` (Azure Table) or `getCursorWhere` (Postgres), fetch `limit + 1` rows, return `getCursorPaginationData(items, limit, sortBy)`:

  ```typescript
  // shared factory — never define limit/cursor manually
  const readModerationLogsInputSchema = z.object({
    ...createCursorPaginationParamsSchema(z.string(), []).omit({ sortBy: true }).shape,
  });
  // Query impl:
  const sortBy: SortItem<keyof ModerationLogEntity>[] = [MESSAGE_ROWKEY_SORT_ITEM];
  if (cursor) clauses.push(...getCursorWhereAzureTable(cursor, sortBy));
  const items = await getTopNEntities(client, limit + 1, ModerationLogEntity, { filter: serializeClauses(clauses) });
  return getCursorPaginationData(items, limit, sortBy);
  ```

- **`refineAtLeastOne`** — when an update/patch schema has all-optional fields and at least one must be provided, use `refineAtLeastOne(schema, ["field1", "field2"])` from `#shared/services/zod/refineAtLeastOne`. Never inline `.refine((data) => ...)`:

  ```typescript
  export const updateFooInputSchema = refineAtLeastOne(
    z.object({ id: ..., name: z.string().optional(), color: z.string().optional() }),
    ["name", "color"],
  );
  ```

- **`satisfies z.ZodType<T>` with class types** — when schema output is plain objects but the interface uses class instances (with `toJSON`), use `Except` + `ToData` to strip `toJSON` from nested classes:

  ```typescript
  export const dataSourceSchema = z.object({...}) satisfies z.ZodType<Except<DataSource, "columns"> & { columns: ToData<Column>[] }>;
  ```
