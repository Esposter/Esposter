---
name: zod
description: Esposter Zod schema conventions — z namespace imports and the export-type z.infer form, string normalization via transform+pipe and the constraints-on-the-final-pipe rule, createUniqueArraySchema for arrays, Zod 4 shorthand APIs (z.email/z.int/z.strictObject/z.enum) and the ZodError issue-push form, persisted-data latest-shape-only, tightest-possible numeric constraints, minimal strict input schemas, .default() rules, named ID field schemas, refineAtLeastOne, record maps over switch, and Except+ToData for class-typed outputs, plus deep dives on validating untrusted boundary payloads, annotating exported schema consts under --isolatedDeclarations, and create*Schema factories / discriminated unions / envelope schemas. Apply when writing Zod schemas. Schemas rendered by Vjsf have extra rules — see the `vjsf` skill.
---

# Zod Conventions

## Deep Dives

- `references/boundary-payloads.md` — when parsing runtime data that crosses a trust boundary: EventGrid data, a queue message, a webhook body, subprocess stdout, a committed config file.
- `references/isolated-declarations.md` — when exporting a schema const from a `packages/*` library, or a consumer's `...someSchema.shape` spread breaks against the published package.
- `references/generic-factories.md` — when a schema needs a type parameter, forms a discriminated union, wraps many payloads in one envelope, or shares a field with only some union members.

## Imports and Inferred Types

- Always the `z` namespace export: `z.ZodType`, `z.ZodError`. Never named imports like `import type { ZodType }`.
- Interface-first (`satisfies z.ZodType<T>`) is the default — see `~/.claude/rules/zod.md`. `z.infer` is for schemas with no hand-written interface (tRPC input schemas), not for models. **Every schema takes it, `z.enum(SomeEnum)` included** — the one-liners are where it goes missing, and there it is what catches a schema pointed at the wrong enum: `rg 'z\.enum\([A-Z]\w+\)\s*(;|$)' | rg -v satisfies` finds them.
- **When you do need infer, always `export type X = z.infer<typeof xSchema>`** — never `interface X extends z.infer<typeof xSchema> {}`. The extends form trips oxlint `import/namespace` (`"infer" not found in imported namespace`), because the `z` namespace can't be resolved in `extends` position.
- **Declare the `type` directly beneath its schema and reference it by name** — the alias lives next to the `const xSchema = z.object({...})` it derives from, and use sites refer to `X`. Don't inline `z.infer<typeof xSchema>` at the use site.

## String Normalization — Always `.transform().pipe()`

When normalizing a string (trim, lowercase, etc.) before further validation, use `.transform(fn).pipe(refinedSchema)`. Never `.overwrite()` — inconsistent with the codebase.

**Reach for a shared helper before writing the chain by hand**, and the choice between the two is only whether the field may be empty:

| Helper                                    | From                  | Emits                               | Use for                                    |
| ----------------------------------------- | --------------------- | ----------------------------------- | ------------------------------------------ |
| `createNameSchema(maxLength)`             | `@esposter/db-schema` | `.min(1).max(maxLength)` after trim | a field that must carry something — a name |
| `createNormalizedStringSchema(maxLength)` | `@esposter/shared`    | `.max(maxLength)` after trim        | optional prose — a topic, a reason, a note |

Which is which is the whole decision, and it is why hand-rolled copies keep appearing: someone who cannot recall whether the helper forces `min(1)` writes the pipe out instead. If the field has an empty-string default or is `.optional()`, it is the second one.

```typescript
z.string().transform(normalizeString).pipe(z.string().min(1).max(MAX));
z.string()
  .transform((v) => normalizeString(v).toLowerCase())
  .pipe(z.string().min(1).max(MAX));
```

**Consolidate all string constraints (`min`, `max`, `regex`, …) on the single final `.pipe()` output** — never nest pipes when JSON schema output matters. `z.toJSONSchema` / `zodToJsonSchema` run with `io = "output"`: for any `ZodPipe(A, B)` they use `B` and **silently drop constraints on `A`**, so `createNormalizedStringSchema(maxLength, base).pipe(z.string().min(1))` emits `{ minLength: 1 }` with the `maxLength` missing. A helper that nests pipe layers silently drops the constraints declared on the inner ones.

## Arrays — Always `createUniqueArraySchema`

**Never call `.array()` directly** unless duplicates are genuinely valid. Use `createUniqueArraySchema(schema)` from `@esposter/shared` — it wraps `.array()` with a uniqueness refine, and all chaining (`.min()`, `.max()`, `.nullable()`, `.optional()`, `.default()`) works identically after (Zod 4's `.refine()` returns the same `ZodArray` type). For object arrays, pass the uniquely-identifying field name as the second argument:

```typescript
createUniqueArraySchema(z.string()).max(MAX_READ_LIMIT); // not z.string().array()
createUniqueArraySchema(fooSchema, "id").max(FOO_MAX_LENGTH).default([]);
```

**Exception — duplicates are valid:** use plain `.array()` when the array semantically allows duplicates (positional DOM bounds, the same config at different values, ordered content blocks). Don't add an artificial `id` field just to force uniqueness.

## Zod 4 APIs

- **Format validators and numeric refinements are top-level functions** — never the Zod 3 chained syntax: `z.email()`, `z.url()`, `z.uuid()`, `z.nanoid()`, `z.cuid()`/`z.cuid2()`, `z.ulid()`, `z.emoji()`, `z.base64()`/`z.base64url()`, `z.ipv4()`/`z.ipv6()` (not `z.string().ip({ version })`), `z.int()` (not `z.number().int()`), `z.iso.date()`/`.datetime()`/`.time()`/`.duration()`, `z.strictObject({...})` (not `.strict()`), `z.looseObject({...})` (not `.passthrough()`).
- `z.uuid()` strictly validates RFC 9562/4122 — use `z.guid()` for permissive "UUID-like" validation.
- **`z.enum(MyEnum)`** directly for TS string enums; `z.nativeEnum` is Zod 3 only.
- **A refinement's custom text goes under `error`** — `.refine(check, { error: "…", path: [...] })`, never Zod 3's `message`, which still parses and so leaves two spellings of one key in the same tree. The `message` key inside a pushed issue is a different object and keeps its name.
- **Never `.addIssue()` / `.addIssues()` on a `ZodError`** (deprecated in Zod 4) — push directly: `myError.issues.push({ code: "custom", message: "..." })`. `ctx.addIssue()` inside `superRefine` is still valid (it operates on the refinement context, not a `ZodError`).

## Validate, Never Cast

Runtime data crossing any trust boundary (EventGrid `event.data`, queue messages, webhook bodies, subprocess stdout, committed config files) gets a co-located Zod schema parsed at the edge — never `x as unknown as SomeType` or hand-rolled guards + casts. Full rules: `references/boundary-payloads.md`.

## Persisted Data — Latest Shape Only

Schemas for persisted client-authoritative data (save blobs, localStorage state) model **only the latest shape** — no legacy union arms, no `.default()`s covering fields older data lacks, no constructor migration code, no per-element tolerance filters for stale ids. Data that fails to parse resets to a fresh default; the reset is the migration. When a shape changes, change the schema and delete the old shape in the same commit. (Postgres evolves through real Drizzle migrations — unaffected.) Azure Table entities are latest-shape-only as well: a field added to an entity class reads back as its default for every pre-change row, and that is the accepted outcome — never add a read-side inference to guess it back. See `packages/app/content/docs/architecture/persisted-data-latest-shape-only.md`.

## Tightest Possible Constraints

Every field carries the tightest constraint its domain allows — a bare `z.number()` / `z.string()` is only correct when the value is genuinely unbounded. Audit each numeric field against what it models, in the app and in `packages/*` libraries alike:

- Count / quantity / index / byte size (whole, ≥ 0) → `z.int().nonnegative()`; a count that can't be zero (frequency, sample count) → `z.int().positive()`.
- Price / rate / duration / timestamp (fractional, ≥ 0) → `z.number().nonnegative()`; one that can't be zero (price, multiplier) → `z.number().positive()`.
- Percentage → `z.number().min(0).max(100)`.
- Genuinely signed value (deltas, statistical `average`/`minimum`/`maximum`/`summation`, coordinates) → leave `z.number()` bare.

Rules:

- **Integers use `z.int()`**, never `z.number().int()` (Zod 4) and never plain `z.number()` when the value is whole by definition (counts, indices, byte sizes).
- **≥ 0 is `.nonnegative()`, > 0 is `.positive()`** — never `.min(0)` / `.min(1)` for these; reserve `.min(N)` for a domain-specific lower bound (usually paired with an upper).
- **Check the seed/fixture data** before choosing — if every real value is strictly positive (prices, effect multipliers), use `.positive()`, not the weaker `.nonnegative()`.

## Schema Rules

- **Minimal strict input schemas** — model the exact case being implemented now. Prefer required fields over optional + `.refine()` when only one flow is supported; split future variants into separate schemas/procedures later. Use `.refine()` only for cross-field rules that can't be represented structurally.
- **Schema must match its type exactly** — if a field is `FooType`, use `fooTypeSchema`, never inline `z.union([barSchema, ...])`. Every named type has exactly one named schema; never reconstruct a union inline.
- **`.default()`** — never combine `.optional().default(value)` (`.default()` already handles `undefined`). Only use `.default()` in schemas whose TS type is a **class with actual property defaults** (e.g. `class Foo { bar = [] }`). Never add `.default()` to a schema that `satisfies z.ZodType<Interface>` — interfaces have no defaults, so schema and type would misalign. Initialise empties explicitly at the call site (`new MyClass()` or `{ steps: [] }`). **The ban is about a _model_ schema — the shape app code constructs.** A schema standing at a boundary states what the boundary accepts, so a field the interface requires may still carry a default there: a tRPC input declaring the field omittable, or a Vjsf form prefilling it. The output type is unchanged either way, which is why both still satisfy the interface. A Vjsf default in particular **stays on the shared schema and cannot be relocated to the `*Form` one**: `.safeExtend` only accepts a replacement of the same schema type and types a `ZodDefault<ZodString>` in place of a `ZodString` as `never`, so moving it means abandoning `safeExtend` and restating the field (`vjsf` skill).
- **Shared ID field schemas** — always use the named ID schemas (`roomIdSchema`, `userIdSchema`, `userIdsSchema` from `@esposter/db-schema`) for object fields matching their canonical name. Whole schema is just an ID field → use it directly (`const onUpdateSchema = roomIdSchema`). Multi-field objects → spread the shape (`z.object({ ...roomIdSchema.shape, ...userIdSchema.shape, otherField: ... })`). Constrained variants → chain from the shape field (`userIds: userIdsSchema.shape.userIds.min(1)`). For differently-named fields (`targetUserId`, `actorUserId`), use `selectUserSchema.shape.id` directly. A `.pick()` projection of the row that **owns** the column keeps that row's own schema — the rule is about fields being assembled into an object, not a reason to split one row's projection into a pick plus a spread.
- **An object key naming another schema's field is inherited where nothing else checks it.** Which positions those are was measured, by mistyping a key in each and running typecheck — not reasoned about, because the answer is not what it looks like:

  | Position                                             | A wrong key is                                      |
  | ---------------------------------------------------- | --------------------------------------------------- |
  | `.omit()` / `.pick()` on a **generic** `z.ZodObject` | **not caught** — compiles, omits nothing            |
  | `.safeExtend({ … })`                                 | **not caught** — silently adds a field, layers none |
  | `.pick()` / `.omit()` on a **concrete** schema       | caught at the site (`TS2561`)                       |
  | a plain `z.object({ field: src.shape.field })`       | caught, but only downstream at every consumer       |
  | `[src.keyof().enum.field]`                           | caught at the site (`TS2551`)                       |

  So the computed key `[src.keyof().enum.field]: src.shape.field.optional()` is **required** in the first two rows and is the only guard those positions have — a resolver taking `schema: z.ZodObject` and a `*Form` schema layering `.meta()` onto a shared field are both in that set. Everywhere else a literal key is correct and the computed form is noise: `.pick()` already checks itself, and a plain `z.object` field is pinned by the consumers that destructure it. A key that **deliberately differs** from the source (`targetUserId: selectUserSchema.shape.id`) is never a candidate — it is not mirroring a name.

- **A spread of `.shape` carries fields and nothing else** — `.catchall()` and every other whole-object modifier stays behind, where `.extend()` would have brought it. Nothing in the types changes when it goes missing, so the derived schema just starts stripping keys the base kept: re-declare the modifier on the derived schema and pin it with a test, because the typecheck will not.
- **`refineAtLeastOne`** — when an update/patch schema has all-optional fields and at least one must be provided, use `refineAtLeastOne(schema, ["field1", "field2"])` from `#shared/services/zod/refineAtLeastOne`. Never inline `.refine((data) => ...)`.
- **Record maps over switch statements** — when a switch on an enum drives different async operations, prefer `const actionMap: Record<EnumType, (args) => Promise<void>> = {...}` and `await actionMap[type](args)`. Exhaustiveness is enforced by the Record key type; no `exhaustiveGuard` needed.
- **`satisfies z.ZodType<T>` with class types** — when schema output is plain objects but the interface uses class instances (with `toJSON`), use `Except` + `ToData` to strip `toJSON` from nested classes:

  ```typescript
  export const fooSchema = z.object({...}) satisfies z.ZodType<Except<Foo, "bars"> & { bars: ToData<Bar>[] }>;
  ```

- **vjsf form schemas** — a schema rendered by Vjsf gets a separate `*Form` interface + schema, `layout`/title meta, ajv keywords, and its own discriminated-union rules: the `vjsf` skill owns all of it.
- **Paginated endpoint schemas** — see the `trpc` skill (`references/read-endpoints.md`).
