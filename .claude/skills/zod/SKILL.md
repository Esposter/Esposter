---
name: zod
description: Esposter Zod schema conventions — z namespace imports and the export-type z.infer form, string normalization via transform+pipe (and the nested-pipe JSON-schema trap), createUniqueArraySchema for arrays, validating external/boundary payloads (incl. isolatedDeclarations annotations), Zod 4 shorthand APIs, persisted-data latest-shape-only, tightest-possible constraints, and generic create*Schema factories. Apply when writing Zod schemas. Schemas rendered by Vjsf have extra rules — see the `vjsf` skill.
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

**Rule:** consolidate all string constraints (`min`, `max`, `regex`, etc.) on the **single final `.pipe()` output**, never spread across layers. A helper that nests pipe layers silently drops the constraints declared on the inner ones.

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

Runtime data crossing any trust boundary — EventGrid `event.data`, Storage Queue messages, webhook bodies, **subprocess stdout, and committed config files** (`virrun.config.json`) — is untyped. **Never** assert with `x as unknown as SomeType` or hand-roll type guards + casts (`as Record<string, unknown>`, `Object.values(E) as string[]`); a malformed payload then throws deep in the handler instead of at the edge. Define a co-located Zod schema and `.parse()` at the boundary.

For untrusted JSON that arrives as a string (subprocess output, file contents), parse + validate in **one** `getResult`/`getResultAsync` and wrap the failure in `InvalidOperationError(Operation.Read, fn.name, …)` so malformed JSON and a schema mismatch surface identically at the call site — canonical refs: `virrun/src/services/exec/snapshot/parseOverlayManifest.ts` (process stdout) and `virrun/src/services/configuration/parseVirrunConfiguration.ts` (config file). Use `z.strictObject` for closed configs so an unknown key (a typo) fails loud rather than being silently stripped.

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
- **`.parse()` as the first line inside `getResultAsync(async () => { ... })`** (matching `processScheduledMessageJobHandler`) so a validation failure flows through the handler's fatal `logAndRethrow` path (see the **error-handling** skill's Azure Functions section) instead of throwing synchronously outside it. Let the parsed value's inferred type flow downstream — drop the redundant `import type { *EventGridData }`.
- **`.nullish()` is allowed here** — the app-owned `.nullable()` ban doesn't apply at the external boundary. EventGrid `notificationOptions` fields are `null | string`, so `z.string().nullish()` is correct.
- **Under `--isolatedDeclarations` (on for `packages/*` libraries; not the app, and `db-schema` opts out via `isolatedDeclarations: false`), annotate the concrete `z.ZodObject<{...}>` shape AND keep `satisfies`.** **Never shortcut with `: z.ZodType<T>`** — it erases the shape, so the built `dist/*.d.ts` exposes no `.shape` and consumers spreading `...someSchema.shape` break against the published package (this bit `itemMetadataSchema`, spread in `AItemEntity` and `AzureEntity`).

  **The annotation is always required for an exported schema const** — `tsgo` cannot emit a `z.object({...})` expression's type without the checker, so even an all-primitive object fails with TS9010/9013 (verified). There is no "simple schema needs no annotation" exception.

  ```typescript
  export const itemMetadataSchema: z.ZodObject<{
    createdAt: z.ZodDate;
    deletedAt: z.ZodNullable<z.ZodDate>;
  }> = z.object({ createdAt: z.date(), deletedAt: z.date().nullable() }) satisfies z.ZodType<ItemMetadata>;
  ```

  Annotation pins a portable shape (`.shape` survives emit); `satisfies` still enforces interface conformance. Match each field's zod type exactly (`z.array(x)`→`z.ZodArray<typeof x>`; `z.enum(MyEnum)`→`z.ZodEnum<typeof MyEnum>`; `z.strictObject` carries a second `z.core.$strict` config param; reference an imported/`.pick()`-ed sub-schema via `typeof`, extracting an inline `.pick()` to a local `const` first). Annotate unions/enums with their concrete type too (`z.ZodDiscriminatedUnion<...>`, `z.ZodEnum<...>`), never `z.ZodType<T>`. **To discover the exact type to write**, temporarily assign the schema to `const _: null = mySchema;` and run the package's `typecheck` — the `TS2322` error prints the full inferred `ZodObject<...>` type verbatim; paste it into the annotation and delete the probe. In the **app** and **db-schema** (no `--isolatedDeclarations`), keep plain `satisfies z.ZodType<T>` — inference emits the full `ZodObject`.

## Imports

Always use the `z` namespace export: `z.ZodType`, `z.ZodError`. Never named imports like `import type { ZodType }`.

## Inferring Types from a Schema

Interface-first (`satisfies z.ZodType<T>`) is the default — see `~/.claude/rules/zod.md`. `z.infer` is for schemas with no hand-written interface (tRPC input schemas: `CreateTypingInput`, `ReadMessagesInput`), not for models.

- **When you do need infer, always `export type X = z.infer<typeof xSchema>`** — never `interface X extends z.infer<typeof xSchema> {}`. The extends form trips oxlint `import/namespace` (`"infer" not found in imported namespace`), because the `z` namespace can't be resolved in `extends` position.
- **Declare the `type` directly beneath its schema and reference it by name** — the alias lives next to the `const xSchema = z.object({...})` it derives from, and use sites refer to `X`. Don't inline `z.infer<typeof xSchema>` at the use site.

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

## Persisted Data — Latest Shape Only

Schemas for persisted client-authoritative data (save blobs, localStorage state) model **only the latest shape** — no legacy union arms, no `.default()`s covering fields older data lacks, no constructor migration code, no per-element tolerance filters for stale ids. Data that fails to parse resets to a fresh default; the reset is the migration. When a shape changes, change the schema and delete the old shape in the same commit. (Postgres evolves through real Drizzle migrations — unaffected.) Azure Table entities are latest-shape-only as well: a field added to an entity class reads back as its default for every pre-change row, and that is the accepted outcome — never add a read-side inference to guess it back. See `docs/architecture/persisted-data-latest-shape-only.md`.

## Tightest Possible Constraints

Every field carries the tightest constraint its domain allows — a bare `z.number()` / `z.string()` is only correct when the value is genuinely unbounded (e.g. statistical `average`/`minimum`/`maximum`/`summation`, which can be negative). Audit each numeric field against what it models:

| Domain                                                | Schema                       |
| ----------------------------------------------------- | ---------------------------- |
| Count / quantity / index / byte size (whole, ≥ 0)     | `z.int().nonnegative()`      |
| Count that can't be zero (frequency, sample count)    | `z.int().positive()`         |
| Price / rate / duration / timestamp (fractional, ≥ 0) | `z.number().nonnegative()`   |
| Price / multiplier that can't be zero                 | `z.number().positive()`      |
| Percentage                                            | `z.number().min(0).max(100)` |
| Genuinely signed value (deltas, stats, coordinates)   | `z.number()` — leave bare    |

Rules:

- **Integers use `z.int()`**, never `z.number().int()` (Zod 4) and never plain `z.number()` when the value is whole by definition (counts, indices, `rdev`, byte sizes). `z.int()` stays `z.ZodNumber` under `--isolatedDeclarations` annotations — no annotation change needed.
- **≥ 0 is `.nonnegative()`, > 0 is `.positive()`** — never `.min(0)` / `.min(1)` for these; reserve `.min(N)` for a domain-specific lower bound (usually paired with an upper).
- **Check the seed/fixture data** before choosing — if every real value is strictly positive (prices, effect multipliers), use `.positive()`, not the weaker `.nonnegative()`.
- Same audit applies in `packages/*` libraries — refinements like `.nonnegative()` don't change the `z.ZodObject<{...}>` annotation, so tightening is annotation-safe; still verify with the package's `typecheck`.

## Schema Rules

- **Minimal strict input schemas** — model the exact case being implemented now. Prefer required fields over optional + `.refine()` when only one flow is supported; split future variants into separate schemas/procedures later. Use `.refine()` only for cross-field rules that can't be represented structurally.
- **`z.enum` with native enums (Zod 4)** — use `z.enum(MyEnum)` directly for TS string enums; `z.nativeEnum` is Zod 3 only.
- **Schema must match its type exactly** — if a field is `ColumnFormat`, use `columnFormatSchema`, never inline `z.union([booleanFormatSchema, ...])`. Every named type has exactly one named schema; never reconstruct a union inline.
- **`.default()`** — never combine `.optional().default(value)` (`.default()` already handles `undefined`). Only use `.default()` in schemas whose TS type is a **class with actual property defaults** (e.g. `class Foo { bar = [] }`). Never add `.default()` to a schema that `satisfies z.ZodType<Interface>` — interfaces have no defaults, so schema and type would misalign. Initialise empties explicitly at the call site (`new MyClass()` or `{ steps: [] }`).
- **Generic schemas** — when an abstract class/interface has a generic type param (e.g. `AColumn<TColumnType>`), its schema must be generic too: export a `create*Schema` function taking typed zod schemas as params. Never hardcode type-specific values in a base schema. Use `T` for one param, descriptive `T*` (`TType`, `TConfiguration`) for multiple. Canonical: `createAColumnSchema` / `createAColumnFormSchema` (`shared/models/resource/sheet/column/`), `createCursorPaginationParamsSchema`, `createSortItemSchema`.

  ```typescript
  // AColumnForm.ts — generic factory; concrete literal passed by callers
  export const createAColumnFormSchema = <T extends z.ZodType<ColumnType>>(typeSchema: T) => {
    const aColumnSchema = createAColumnSchema(typeSchema);
    return z.object({
      description: aColumnSchema.shape.description,
      name: aColumnSchema.shape.name.meta({ title: "Column", [uniqueColumnNameKeywordDefinition.keyword]: true }),
      sourceName: aColumnSchema.shape.sourceName.meta({ title: "Source Column" }),
      type: typeSchema,
    });
  };

  // DateColumnForm.ts — caller spreads the factory's .shape (never .extend()), adds its own fields, satisfies its interface
  export const dateColumnFormSchema = z
    .object({
      ...createAColumnFormSchema(z.literal(ColumnType.Date).readonly()).shape,
      format: dateColumnSchema.shape.format,
    })
    .meta({ title: ColumnType.Date }) satisfies z.ZodType<DateColumnForm>;
  ```

  The union lives in the file named after the union type (`ColumnForm.ts`), declared **before** the schema, with `satisfies` — see `~/.claude/rules/zod.md`. Adding a new type = add its schema to the union array.

  ```typescript
  export type ColumnForm =
    BooleanColumnForm | ComputedColumnForm | DateColumnForm | NumberColumnForm | StringColumnForm;

  export const columnFormSchema = z.discriminatedUnion("type", [
    booleanColumnFormSchema,
    computedColumnFormSchema,
    dateColumnFormSchema,
    numberColumnFormSchema,
    stringColumnFormSchema,
  ]) satisfies z.ZodType<ColumnForm>;
  ```

- **vjsf form schemas** — a schema rendered by Vjsf gets a separate `*Form` interface + schema, `layout`/title meta, ajv keywords, and its own discriminated-union rules: the `vjsf` skill owns all of it.
- **Envelope schemas are factories, not copies** — when many payloads share one wrapper and differ only in an inner field, declare the wrapper once as a `create*Schema` factory parameterised on that field, and pair it with the `Pick`-from-the-SDK type (typescript skill, "Configuration Interfaces"). Canonical: `createEventGridEventSchema(dataSchema)` in `packages/db-schema/src/models/azure/eventGrid/EventGridEventInput.ts` — every Event Grid consumer parses with it (`createEventGridEventSchema(z.unknown())` when the payload is opaque, `createEventGridEventSchema(pushNotificationEventGridDataSchema)` when it isn't) instead of restating `dataVersion` / `eventType` / `id` / `subject` per event model.
- **Opt-in shared field schemas for union members** — when _some_ (not all) members of a discriminated union share a field, give it its own interface + `create*Schema` factory file that members opt into by spreading its `.shape` (`createSourceColumnIdSchema`); never force the field onto every member via the base schema. Members that don't need it use `z.object({...})` directly. Naming (`SourceColumnId`, not `WithSourceColumnId`) is the naming skill's rule.
- **`ColumnTransformationType` enum values** — short descriptive names matching the domain (`Aggregation`, `ConvertTo`, `DatePart`, `Math`, `RegexMatch`, `String`), distinct from interface names (`AggregationTransformation` → `ColumnTransformationType.Aggregation`).
- **Shared ID field schemas** — always use named ID schemas for object fields matching their canonical name:
  - Whole schema is just an ID field → use the schema directly: `const onUpdateSchema = roomIdSchema`, not `z.object({ roomId: selectRoomInMessageSchema.shape.id })`.
  - Multi-field objects → spread the shape: `z.object({ ...roomIdSchema.shape, ...userIdSchema.shape, otherField: ... })`.
  - Constrained variants (e.g. adding `.min(1)` to `userIds`) → chain from the shape field: `userIds: userIdsSchema.shape.userIds.min(1)`, not `selectUserSchema.shape.id.array().min(1)...`.
  - Named schemas `roomIdSchema`, `userIdSchema`, `userIdsSchema` from `@esposter/db-schema`. For differently-named fields (`targetUserId`, `actorUserId`), use `selectUserSchema.shape.id` directly.
- **Record maps over switch statements** — when a switch on an enum drives different async operations, prefer `const actionMap: Record<EnumType, (args) => Promise<void>> = {...}` and `await actionMap[type](args)`. Exhaustiveness is enforced by the Record key type; no `exhaustiveGuard` needed.
- **Paginated endpoint schemas** — see the `trpc` skill (Pagination Params Schemas).
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
