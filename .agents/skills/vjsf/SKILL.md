---
name: vjsf
description: Esposter vjsf form-schema conventions — the separate *Form interface/schema (never the entity schema), layout meta (comp/getItems/getProps), ajv keywords for cross-field validation, discriminated-union form quirks (variant titles, .readonly() discriminants, passing the union straight to Vjsf), the getItems context and VjsfOptions typing, *TypeFormSchemaMap for dirty-state narrowing, and inline json-schema snapshot tests. Apply when writing a schema rendered by Vjsf, a vjsf-backed form dialog, or its options/context.
---

# Vjsf Form Schemas

General Zod schema conventions are the `zod` skill's; this skill owns only what changes because the schema is rendered by Vjsf.

## Form Schema ≠ Validation Schema

**Never pass a full entity schema to `zodToJsonSchema()`** — an entity schema contains `z.date()` fields and Vjsf throws on them. Model a separate `*Form` interface + `*FormSchema` (one per file, e.g. `BarFooForm.ts`) covering only user-editable fields (no `id`/`createdAt`/`updatedAt`), built by spreading the base factory's `.shape` and re-`.meta()`-ing fields for titles. Pull individual field validators off the entity schema's `.shape` (`fooSchema.shape.bar`) rather than redeclaring them — the entity schema stays the validation contract, the form schema is the rendering contract.

`.meta({ title })` values use **enum values directly**, not string literals; `zodToJsonSchema` runs `toTitleCase(prettify(...))` automatically, so an enum value like `FooType.ConvertTo` renders as `"Convert To"`.

## `layout` Meta

Put `comp`, `getItems`, `getProps` under the `layout` key of the field's `.meta()` **in the schema**, never injected dynamically from a composable. `GlobalMeta` (`shared/types/zod.d.ts`) types `layout?: Partial<PartialCompObject>` — its values are vjsf JS expression strings evaluated at runtime against the vjsf `context` (passed via `:options`):

```typescript
description: z.string().meta({ layout: { comp: "textarea" } }),
fooId: z.string().meta({ layout: { comp: "select", getItems: "context.fooItems" } }),
```

**`GlobalMeta` carries only `layout` + ajv keywords** (`interface GlobalMeta extends AjvKeywords { layout?: Partial<PartialCompObject> }`). Don't add per-feature meta keys to it — filtering that looks like it wants a meta key is done by passing a pre-filtered context key into the field's factory (see `getItems` below).

## Cross-Field Validation Is an Ajv Keyword, Not a `getProps` Rules Expression

A check needing values outside the field (e.g. name uniqueness against sibling rows) is declared as a `.meta()` ajv keyword flag and implemented as an ajv `validate` fn passed through `options.ajvOptions.keywords`, so the rule stays typed and testable:

```typescript
name: aFooSchema.shape.name.meta({ [uniqueFooNameKeywordDefinition.keyword]: true }),
```

Choosing between an ajv keyword, a validation composable, and a global rule alias — and the runtime wiring of the `validate` fn — is the `vue-composable-patterns` skill's ("Validation Rules — Pick the Right Layer").

## Discriminated-Union Forms

- **Every variant needs `.meta({ title })` on the variant object** (not just on its fields), else Vjsf shows "Option 1", "Option 2". Set it on the schema at definition time:

  ```typescript
  export const barFooSchema = z.object({ ... }).meta({ title: FooType.Bar });
  ```

- **The discriminant's typing decides whether editing works** — four cases, only two are usable:
  - `z.literal(Foo.Bar).readonly()` — Vjsf reads `const`, auto-sets the discriminant when switching variants AND auto-detects the active variant when pre-populating. ✓ **Always add `.readonly()` to literal discriminants in form schemas.**
  - `z.literal(Foo.Bar)` (no `.readonly()`) — **BROKEN auto-detection**: can't pre-select the variant when editing. Never omit `.readonly()`.
  - `z.enum([...])` (no `.readonly()`) — renders a select; uses the first enum value as default on switch. ✓
  - `z.enum([...]).readonly()` — **BROKEN**: `readOnly: true` but no `const`, so Vjsf can't determine the value on switch and the old value persists. **Never use `.readonly()` on an enum discriminant.**

- **Pass the discriminated union straight to Vjsf.** Because every variant's discriminant is a single `const`, Vjsf auto-detects the active `oneOf` variant when pre-populating and renders its own variant selector. So there is no per-type discriminant ref, no type-selector reset handler, and no precomputed JSON schema map file. `jsonSchema` is a plain `const` (the union schema never changes), not a `computed`:

  ```typescript
  const jsonSchema = zodToJsonSchema(fooFormSchema);
  // <Vjsf v-model="editedFoo" :schema="jsonSchema" :options />
  ```

- **`*TypeFormSchemaMap` is for narrowing a value to one variant's fields, not for choosing the form schema.** It lives in the union's own file (alongside the union schema), maps each enum key to **its own** variant schema, and is consumed by `extractSchemaFields(FooTypeFormSchemaMap[foo.type], foo)` to compare edited-vs-original for dirty state:

  ```typescript
  export const FooTypeFormSchemaMap = {
    [FooType.Bar]: barFooFormSchema,
    [FooType.Baz]: bazFooFormSchema,
    // …one per enum member
  } as const satisfies Record<FooType, z.ZodType<FooForm>>;
  ```

## `getItems` Filtering via the Context

To show only certain rows in a select, pass the **pre-filtered context key** into the field's `create*Schema` factory (e.g. `createFooIdSchema(getItems)`, defaulting to `context.fooItems`). The factory bakes `getItems` into `layout`, so consumers just spread its `.shape`. The per-type lists are built once by the form-options composable, not inline in each component:

```typescript
export const barFooSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(FooType.Bar).readonly()).shape,
    ...createFooIdSchema(FooFormVjsfContextPropertyNames["context.barItems"]).shape,
    baz: bazTypeSchema,
  })
  .meta({ title: FooType.Bar }) satisfies z.ZodType<BarFoo>;
```

`getItems` is a JS expression string, so spread works for multiple sources: `"[...context.barItems, ...context.bazItems]"`.

## Options Typing

Type the `options` computed as `VjsfOptions<TContext>` (`VjsfOptions` from `app/models/vjsf/VjsfOptions.ts`); the context interface lives in `app/models/<feature>/<Name>VjsfContext.ts` (one per file), and the computed that builds it is a composable shared by the create and edit dialogs. Alongside `context`, `ajvOptions.keywords` wires the custom ajv keywords:

```typescript
export interface FooFormVjsfContext {
  barItems: SelectItemCategoryDefinition<Foo["id"]>[];
  fooItems: SelectItemCategoryDefinition<Foo["id"]>[];
  // …one per variant that needs a filtered list
}
export const FooFormVjsfContextPropertyNames = getPropertyNames<Pick<VjsfOptions<FooFormVjsfContext>, "context">>();
```

Factory defaults for the edited value come from the discriminant-keyed `*TypeCreateMap` (the `typescript` skill owns that map's shape; the reset-on-discriminant-change watch is the `vue-composable-patterns` skill's). **Dialogs `structuredClone` the created instance** — Vjsf rejects class instances, and fast-deep-equal compares constructors.

A selector that controls _which_ schema renders belongs in the dialog's `#prepend-form` slot — see the `vue-composable-patterns` skill.

## Snapshot Tests

For every schema passed to `zodToJsonSchema()` and rendered by Vjsf, add a `toMatchInlineSnapshot()` test co-located next to the schema file (same folder/base name). Fill via `pnpm vitest run --update`:

```typescript
describe("Foo", () => {
  test("produces correct json schema for vjsf", () => {
    expect.hasAssertions();
    expect(zodToJsonSchema(fooFormSchema)).toMatchInlineSnapshot();
  });
});
```

Watch for the nested-pipe trap when a form field's constraints go missing from the snapshot — the `zod` skill owns it.
