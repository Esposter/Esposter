# `create*Schema` Factories, Unions and Envelopes

## Generic schemas

When an abstract class/interface has a generic type param (e.g. `AFoo<TFooType>`), its schema must be generic too: export a `create*Schema` function taking typed zod schemas as params. Never hardcode type-specific values in a base schema. Use `T` for one param, descriptive `T*` (`TType`, `TConfiguration`) for multiple. Canonical: `createCursorPaginationParamsSchema`, `createSortItemSchema`.

```typescript
// AFooForm.ts — generic factory; concrete literal passed by callers
export const createAFooFormSchema = <T extends z.ZodType<FooType>>(typeSchema: T) => {
  const aFooSchema = createAFooSchema(typeSchema);
  return z.object({
    bar: aFooSchema.shape.bar.meta({ title: "Bar" }),
    description: aFooSchema.shape.description,
    name: aFooSchema.shape.name.meta({ [uniqueFooNameKeywordDefinition.keyword]: true }),
    type: typeSchema,
  });
};

// BarFooForm.ts — caller spreads the factory's .shape (never .extend()), adds its own fields, satisfies its interface
export const barFooFormSchema = z
  .object({
    ...createAFooFormSchema(z.literal(FooType.Bar).readonly()).shape,
    baz: barFooSchema.shape.baz,
  })
  .meta({ title: FooType.Bar }) satisfies z.ZodType<BarFooForm>;
```

## Discriminated unions

The union lives in the file named after the union type (`FooForm.ts`), declared **before** the schema, with `satisfies` — see `~/.claude/rules/zod.md`. Adding a new type = add its schema to the union array.

```typescript
export type FooForm = BarFooForm | BazFooForm;

export const fooFormSchema = z.discriminatedUnion("type", [
  barFooFormSchema,
  bazFooFormSchema,
]) satisfies z.ZodType<FooForm>;
```

Discriminant enum values are short descriptive names matching the domain (`Bar`, `Baz`), distinct from the member interface names (`BarFoo` → `FooType.Bar`).

## Envelope schemas are factories, not copies

When many payloads share one wrapper and differ only in an inner field, declare the wrapper once as a `create*Schema` factory parameterised on that field, and pair it with the `Pick`-from-the-SDK type (typescript skill, "Configuration Interfaces"). Canonical: `createEventGridEventSchema(dataSchema)` in `packages/db-schema/src/models/azure/eventGrid/EventGridEventInput.ts` — every Event Grid consumer parses with it (`createEventGridEventSchema(z.unknown())` when the payload is opaque, `createEventGridEventSchema(pushNotificationEventGridDataSchema)` when it isn't) instead of restating `dataVersion` / `eventType` / `id` / `subject` per event model.

## Opt-in shared field schemas for union members

When _some_ (not all) members of a discriminated union share a field, give it its own interface + `create*Schema` factory file that members opt into by spreading its `.shape` (`createSourceColumnIdSchema`); never force the field onto every member via the base schema. Members that don't need it use `z.object({...})` directly. Naming (`SourceColumnId`, not `WithSourceColumnId`) is the naming skill's rule.

## Maintaining `createUniqueArraySchema`

TS infers `T` from the schema, so a non-existent key argument is a type error. In Zod 4, derive object-schema keys from `z.ZodObject["shape"]` rather than `keyof z.output<TSchema>` — output types can expand into unresolved mapped internals in generic factories. Keep the keyed/keyless signatures as an **intersection function type**, not an overload interface, if `typescript/unified-signatures` pushes to merge them — merging into one optional conditional parameter breaks generic callers like `createUniqueArraySchema(schema, "id")`. The keyed signature must still support non-`ZodObject` object-output schemas (e.g. discriminated unions) by falling back to output keys.
