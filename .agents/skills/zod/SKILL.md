---
name: zod
description: Apply when writing Zod schemas. Esposter Zod schema conventions — the z namespace import with satisfies z.ZodType<T> on every schema, string normalization by transform+pipe with every constraint on the final pipe, createUniqueArraySchema for arrays, Zod 4 shorthand APIs, validate never cast at a trust boundary, persisted data modelled as its latest shape only, the tightest constraint a field earns, .default() only on a class-typed model or at a boundary, the named ID field schemas spread by .shape, and refineAtLeastOne keyed off the schema it guards. Schemas a schema form renders have extra rules — see the ui-library skill.
---

# Zod Conventions

## Settled — do not re-propose

- **A lint rule for the inherited-key rule** — `.safeExtend` legitimately adds new fields as well as layering over existing ones, so nothing syntactic separates the key that must match from the key that must not; `references/field-key-checks.md` carries the measured table of which positions check a key.
- **A ban on `.extend()`** — Tiptap's `.extend` and Zod's share one method name and no syntactic rule tells them apart.
- **A ban on `export type X = z.infer<…>`** — allowed in the narrow composed-schema case, which needs the judgement.

## Deep Dives

- `references/boundary-payloads.md` — when parsing runtime data that crosses a trust boundary: EventGrid data, a queue message, a webhook body, subprocess stdout, a committed config file.
- `references/isolated-declarations.md` — when exporting a schema const from a `packages/*` library, or a consumer's `...someSchema.shape` spread breaks against the published package.
- `references/generic-factories.md` — when a schema needs a type parameter, forms a discriminated union, wraps many payloads in one envelope, or shares a field with only some union members.
- `references/string-normalization.md` — when a string is trimmed or lowercased before validation: the two shared helpers and the hand-written chain.
- `references/numeric-constraints.md` — when adding a numeric field: which constraint its meaning earns.
- `references/field-key-checks.md` — when an object key mirrors another schema's field and the choice is a literal key or the computed `[src.keyof().enum.field]`.
- `references/arrays.md` — when a schema holds an array.
- `references/zod-4-apis.md` — when writing a format validator, an enum schema, a refinement's error text, or an issue on a `ZodError`.
- `references/defaults.md` — when a field is about to take `.default()`.
- `references/id-fields.md` — when a schema has an id field.
- `references/refine-at-least-one.md` — when an update schema needs at least one of its optional fields.
- `references/class-types.md` — when a schema satisfies an interface holding class instances.

## Imports and Inferred Types

- Always the `z` namespace export: `z.ZodType`, `z.ZodError` — a named import beside it is a `no-restricted-syntax` error.
- Interface-first (`satisfies z.ZodType<T>`) is the default — see `~/.claude/rules/zod.md`. `z.infer` is for schemas with no hand-written interface (tRPC input schemas), not for models. **Every schema takes it** — a bare `z.enum(SomeEnum)` or `z.discriminatedUnion(…)` declarator is a `no-restricted-syntax` error in source, since those are where it goes missing and where it is what catches a schema pointed at the wrong enum or a variant drifting from its interface.
- **When you do need infer, always `export type X = z.infer<typeof xSchema>`** — never `interface X extends z.infer<typeof xSchema> {}`. The extends form trips oxlint `import/namespace` (`"infer" not found in imported namespace`), because the `z` namespace can't be resolved in `extends` position.
- **Declare the `type` directly beneath its schema and reference it by name** — the alias lives next to the `const xSchema = z.object({...})` it derives from, and use sites refer to `X`. Don't inline `z.infer<typeof xSchema>` at the use site.

## String Normalization — `references/string-normalization.md`

`.transform(fn).pipe(refinedSchema)`, never `.refine()` for normalisation, with every string constraint on the single final `.pipe()` output. Reach for `createNameSchema(maxLength)` (`@esposter/db-schema`, required) or `createNormalizedStringSchema(maxLength)` (`@esposter/shared`, optional prose) before writing the chain by hand — which is which is that page.

## Arrays — Always `createUniqueArraySchema`

Never `.array()` directly — `createUniqueArraySchema(schema, key?)` from `@esposter/shared`, unless duplicates are genuinely valid (`references/arrays.md`).

## Zod 4 APIs

Zod 4's top-level builders (`z.email()`, `z.int()`, `z.strictObject`), `z.enum(MyEnum)`, a refinement's text under `error`, and an issue pushed onto `error.issues` (`references/zod-4-apis.md`).

## Validate, Never Cast

Runtime data crossing any trust boundary (EventGrid `event.data`, queue messages, webhook bodies, subprocess stdout, committed config files) gets a co-located Zod schema parsed at the edge — never `x as unknown as SomeType` or hand-rolled guards + casts. Full rules: `references/boundary-payloads.md`.

## Persisted Data — Latest Shape Only

Schemas for persisted client-authoritative data (save blobs, localStorage state) and Azure Table entities model **only the latest shape** — no legacy union arms, no `.default()`s covering fields older data lacks, no migration code, no read-side inference of a field a pre-change row lacks. A parse failure resets the data to a fresh default; the reset is the migration, and the old shape is deleted in the same commit. Standard: `apps/web/content/docs/architecture/persisted-data-latest-shape-only.md`.

## Tightest Possible Constraints — `references/numeric-constraints.md`

Every field carries the tightest constraint its domain allows — a bare `z.number()` / `z.string()` is only correct where any value is valid. On a tRPC input the string and array half is enforced: `apps/web/server/trpc/routers/index.test.ts` walks every procedure's input as JSON Schema and fails on a string with no length, format or pattern and an array with no item cap. Integers are `z.int()`, ≥ 0 is `.nonnegative()`, > 0 is `.positive()`, and the seed data says which; the mapping from a field's meaning to its constraint is that page.

## Schema Rules

- **Minimal strict input schemas** — model the exact case being implemented now. Prefer required fields over optional + `.refine()` when only one flow is supported; split future variants into separate schemas/procedures later. Use `.refine()` only for cross-field rules that can't be represented structurally.
- **Schema must match its type exactly** — if a field is `FooType`, use `fooTypeSchema`, never inline `z.union([barSchema, ...])`. Every named type has exactly one named schema; never reconstruct a union inline.
- **`.default()` only on a class-typed model or at a boundary**, never with `.optional()` and never on a schema satisfying an interface (`references/defaults.md`).
- **Named ID field schemas** (`roomIdSchema`, `userIdSchema`, `userIdsSchema`), spread by `.shape` into a multi-field object (`references/id-fields.md`).
- **A field several models share is one named interface + schema** — when multiple models share a field (e.g. `bar`), define a single `Bar` / `barSchema` (named after the capability — `naming` skill) in `shared/models/entity/` and spread the schema's `.shape` into each model schema. Don't add `.default(...)` to the shared schema — each implementing class declares its own default as a class field and adds it at the schema call site.
- **An object key mirroring another schema's field is checked nowhere in two positions** — `.pick()`/`.omit()` on a generic `z.ZodObject` and `.safeExtend({ … })` — so there the key is the computed `[src.keyof().enum.field]`; everywhere else a literal key is correct and the computed form is noise (`references/field-key-checks.md`).
- **A spread of `.shape` carries fields and nothing else** — `.catchall()` and every other whole-object modifier stays behind, where `.extend()` would have brought it. Nothing in the types changes when it goes missing, so the derived schema just starts stripping keys the base kept: re-declare the modifier on the derived schema and pin it with a test, because the typecheck will not.
- **`refineAtLeastOne`**, its key list read off the schema it guards, never restated (`references/refine-at-least-one.md`).
- **An enum dispatching per-case logic is a map keyed by it**, not a switch — the `typescript` skill (`references/control-flow.md`).
- **A schema for a class-typed interface strips `toJSON` with `Except` + `ToData`** (`references/class-types.md`).
- **Schema form schemas** — a schema a `UiSchemaForm` renders gets a separate `*Form` interface and schema, `layout` and title meta, a refinement for a cross-field rule, and its own union rules: the `ui-library` skill's `references/schema-forms.md` owns all of it.
- **Paginated endpoint schemas** — see the `trpc` skill (`references/read-endpoints.md`).
