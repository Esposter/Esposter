# `create*Schema` Factories, Unions and Envelopes

## Generic schemas

When an abstract class/interface has a generic type param (e.g. `AColumn<TColumnType>`), its schema must be generic too: export a `create*Schema` function taking typed zod schemas as params. Never hardcode type-specific values in a base schema. Use `T` for one param, descriptive `T*` (`TType`, `TConfiguration`) for multiple. Canonical: `createAColumnSchema` / `createAColumnFormSchema` (`shared/models/resource/sheet/column/`), `createCursorPaginationParamsSchema`, `createSortItemSchema`.

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

## Discriminated unions

The union lives in the file named after the union type (`ColumnForm.ts`), declared **before** the schema, with `satisfies` — see `~/.claude/rules/zod.md`. Adding a new type = add its schema to the union array.

```typescript
export type ColumnForm = BooleanColumnForm | ComputedColumnForm | DateColumnForm | NumberColumnForm | StringColumnForm;

export const columnFormSchema = z.discriminatedUnion("type", [
  booleanColumnFormSchema,
  computedColumnFormSchema,
  dateColumnFormSchema,
  numberColumnFormSchema,
  stringColumnFormSchema,
]) satisfies z.ZodType<ColumnForm>;
```

Discriminant enum values are short descriptive names matching the domain (`Aggregation`, `ConvertTo`, `DatePart`, `Math`, `RegexMatch`, `String`), distinct from the member interface names (`AggregationTransformation` → `ColumnTransformationType.Aggregation`).

## Envelope schemas are factories, not copies

When many payloads share one wrapper and differ only in an inner field, declare the wrapper once as a `create*Schema` factory parameterised on that field, and pair it with the `Pick`-from-the-SDK type (typescript skill, "Configuration Interfaces"). Canonical: `createEventGridEventSchema(dataSchema)` in `packages/db-schema/src/models/azure/eventGrid/EventGridEventInput.ts` — every Event Grid consumer parses with it (`createEventGridEventSchema(z.unknown())` when the payload is opaque, `createEventGridEventSchema(pushNotificationEventGridDataSchema)` when it isn't) instead of restating `dataVersion` / `eventType` / `id` / `subject` per event model.

## Opt-in shared field schemas for union members

When _some_ (not all) members of a discriminated union share a field, give it its own interface + `create*Schema` factory file that members opt into by spreading its `.shape` (`createSourceColumnIdSchema`); never force the field onto every member via the base schema. Members that don't need it use `z.object({...})` directly. Naming (`SourceColumnId`, not `WithSourceColumnId`) is the naming skill's rule.

## Maintaining `createUniqueArraySchema`

TS infers `T` from the schema, so a non-existent key argument is a type error. In Zod 4, derive object-schema keys from `z.ZodObject["shape"]` rather than `keyof z.output<TSchema>` — output types can expand into unresolved mapped internals in generic factories. Keep the keyed/keyless signatures as an **intersection function type**, not an overload interface, if `typescript/unified-signatures` pushes to merge them — merging into one optional conditional parameter breaks generic callers like `createTableEditorSchema(schema, "id")`. The keyed signature must still support non-`ZodObject` object-output schemas (e.g. discriminated unions) by falling back to output keys.
