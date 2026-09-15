---
name: zod
description: Apply when writing Zod schemas. Esposter Zod schema conventions — the z namespace import with satisfies z.ZodType<T> on every schema, string normalization by transform+pipe with every constraint on the final pipe, createUniqueArraySchema for arrays, Zod 4 shorthand APIs, validate never cast at a trust boundary, persisted data modelled as its latest shape only, the tightest constraint a field earns, .default() only on a class-typed model or at a boundary, the named ID field schemas spread by .shape, and refineAtLeastOne keyed off the schema it guards. Schemas rendered by Vjsf have extra rules — see the vjsf skill.
---

# Zod Conventions

## Deep Dives

- `references/boundary-payloads.md` — when parsing runtime data that crosses a trust boundary: EventGrid data, a queue message, a webhook body, subprocess stdout, a committed config file.
- `references/isolated-declarations.md` — when exporting a schema const from a `packages/*` library, or a consumer's `...someSchema.shape` spread breaks against the published package.
- `references/generic-factories.md` — when a schema needs a type parameter, forms a discriminated union, wraps many payloads in one envelope, or shares a field with only some union members.
- `references/string-normalization.md` — when a string is trimmed or lowercased before validation: the two shared helpers and the hand-written chain.
- `references/numeric-constraints.md` — when adding a numeric field: which constraint its meaning earns.
- `references/field-key-checks.md` — when an object key mirrors another schema's field and the choice is a literal key or the computed `[src.keyof().enum.field]`.

## Imports and Inferred Types

- Always the `z` namespace export: `z.ZodType`, `z.ZodError`. Never named imports like `import type { ZodType }`.
- Interface-first (`satisfies z.ZodType<T>`) is the default — see `~/.claude/rules/zod.md`. `z.infer` is for schemas with no hand-written interface (tRPC input schemas), not for models. **Every schema takes it, `z.enum(SomeEnum)` included** — the one-liners are where it goes missing, and there it is what catches a schema pointed at the wrong enum: `rg 'z\.enum\([A-Z]\w+\)\s*(;|$)' | rg -v satisfies` finds them. A `z.discriminatedUnion(…)` declarator without it is a `no-restricted-syntax` error in source, since there a variant drifting from its interface is still a valid schema.
- **When you do need infer, always `export type X = z.infer<typeof xSchema>`** — never `interface X extends z.infer<typeof xSchema> {}`. The extends form trips oxlint `import/namespace` (`"infer" not found in imported namespace`), because the `z` namespace can't be resolved in `extends` position.
- **Declare the `type` directly beneath its schema and reference it by name** — the alias lives next to the `const xSchema = z.object({...})` it derives from, and use sites refer to `X`. Don't inline `z.infer<typeof xSchema>` at the use site.

## String Normalization — `references/string-normalization.md`

`.transform(fn).pipe(refinedSchema)`, never `.refine()` for normalisation, with every string constraint on the single final `.pipe()` output. Reach for `createNameSchema(maxLength)` (`@esposter/db-schema`, required) or `createNormalizedStringSchema(maxLength)` (`@esposter/shared`, optional prose) before writing the chain by hand — which is which is that page.

## Arrays — Always `createUniqueArraySchema`

**Never call `.array()` directly** unless duplicates are genuinely valid. Use `createUniqueArraySchema(schema)` from `@esposter/shared` — it wraps `.array()` with a uniqueness refine, and all chaining (`.min()`, `.max()`, `.nullable()`, `.optional()`, `.default()`) works identically after (Zod 4's `.refine()` returns the same `ZodArray` type). For object arrays, pass the uniquely-identifying field name as the second argument:

```ts
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

Schemas for persisted client-authoritative data (save blobs, localStorage state) and Azure Table entities model **only the latest shape** — no legacy union arms, no `.default()`s covering fields older data lacks, no migration code, no read-side inference of a field a pre-change row lacks. A parse failure resets the data to a fresh default; the reset is the migration, and the old shape is deleted in the same commit. Standard: `apps/web/content/docs/architecture/persisted-data-latest-shape-only.md`.

## Tightest Possible Constraints — `references/numeric-constraints.md`

Every field carries the tightest constraint its domain allows — a bare `z.number()` / `z.string()` is only correct where any value is valid. Integers are `z.int()`, ≥ 0 is `.nonnegative()`, > 0 is `.positive()`, and the seed data says which; the mapping from a field's meaning to its constraint is that page.

## Schema Rules

- **Minimal strict input schemas** — model the exact case being implemented now. Prefer required fields over optional + `.refine()` when only one flow is supported; split future variants into separate schemas/procedures later. Use `.refine()` only for cross-field rules that can't be represented structurally.
- **Schema must match its type exactly** — if a field is `FooType`, use `fooTypeSchema`, never inline `z.union([barSchema, ...])`. Every named type has exactly one named schema; never reconstruct a union inline.
- **`.default()`** — never combine `.optional().default(value)` (`.default()` already handles `undefined`). Only use `.default()` in schemas whose TS type is a **class with actual property defaults** (e.g. `class Foo { bar = [] }`). Never add `.default()` to a schema that `satisfies z.ZodType<Interface>` — interfaces have no defaults, so schema and type would misalign. Initialise empties explicitly at the call site (`new MyClass()` or `{ steps: [] }`). **The ban is about a _model_ schema — the shape app code constructs.** A schema standing at a boundary states what the boundary accepts, so a field the interface requires may still carry a default there: a tRPC input declaring the field omittable, or a Vjsf form prefilling it. The output type is unchanged either way, which is why both still satisfy the interface. A Vjsf default stays on the shared schema rather than the `*Form` one, for the `safeExtend` reason the `vjsf` skill gives.
- **Shared ID field schemas** — always use the named ID schemas (`roomIdSchema`, `userIdSchema`, `userIdsSchema` from `@esposter/db-schema`) for object fields matching their canonical name. Whole schema is just an ID field → use it directly (`const onUpdateSchema = roomIdSchema`). Multi-field objects → spread the shape (`z.object({ ...roomIdSchema.shape, ...userIdSchema.shape, otherField: ... })`). Constrained variants → chain from the shape field (`userIds: userIdsSchema.shape.userIds.min(1)`). For differently-named fields (`targetUserId`, `actorUserId`), use `selectUserSchema.shape.id` directly. A `.pick()` projection of the row that **owns** the column keeps that row's own schema — the rule is about fields being assembled into an object, not a reason to split one row's projection into a pick plus a spread.
- **A field several models share is one named interface + schema** — when multiple models share a field (e.g. `bar`), define a single `Bar` / `barSchema` (named after the capability — `naming` skill) in `shared/models/entity/` and spread the schema's `.shape` into each model schema. Don't add `.default(...)` to the shared schema — each implementing class declares its own default as a class field and adds it at the schema call site.
- **An object key mirroring another schema's field is checked nowhere in two positions** — `.pick()`/`.omit()` on a generic `z.ZodObject` and `.safeExtend({ … })` — so there the key is the computed `[src.keyof().enum.field]`; everywhere else a literal key is correct and the computed form is noise (`references/field-key-checks.md`).
- **A spread of `.shape` carries fields and nothing else** — `.catchall()` and every other whole-object modifier stays behind, where `.extend()` would have brought it. Nothing in the types changes when it goes missing, so the derived schema just starts stripping keys the base kept: re-declare the modifier on the derived schema and pin it with a test, because the typecheck will not.
- **`refineAtLeastOne`** — when an update/patch schema has optional fields and at least one must be provided, use `refineAtLeastOne` from `#shared/services/zod/refineAtLeastOne`. Never inline `.refine((data) => ...)`. **Its key list is read off the schema it guards, never restated as literals**: name the updatable fields once as their own schema and pass `updatableFooSchema.keyof().options`, so a field added to the shape is guarded without a second edit. A literal array is right only where the guarded set is deliberately narrower than the schema's optional fields — `updateUserToRoomInputSchema`, whose optional `targetUserId` is a qualifier rather than one of the fields the update must set.
- **Record maps over switch statements** — when a switch on an enum drives different async operations, prefer `const actionMap: Record<EnumType, (args) => Promise<void>> = {...}` and `await actionMap[type](args)`. Exhaustiveness is enforced by the Record key type; no `exhaustiveGuard` needed.
- **`satisfies z.ZodType<T>` with class types** — when schema output is plain objects but the interface uses class instances (with `toJSON`), use `Except` + `ToData` to strip `toJSON` from nested classes:

  ```ts
  export const fooSchema = z.object({...}) satisfies z.ZodType<Except<Foo, "bars"> & { bars: ToData<Bar>[] }>;
  ```

- **vjsf form schemas** — a schema rendered by Vjsf gets a separate `*Form` interface + schema, `layout`/title meta, ajv keywords, and its own discriminated-union rules: the `vjsf` skill owns all of it.
- **Paginated endpoint schemas** — see the `trpc` skill (`references/read-endpoints.md`).
