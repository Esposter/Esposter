# Schema Forms

Read when writing a schema a `UiSchemaForm` renders, a dialog that renders one, or the context it hands the form. General Zod conventions are the `zod` skill's; this page is what changes because JSON Forms lays the schema out and the library's fields draw it. How the form works is `apps/web/content/docs/architecture/ui-library.md`.

## A form schema is not the entity schema

**Never pass a full entity schema to `zodToJsonSchema()`** — an entity carries fields no reader edits, and dates JSON Schema cannot express. Model a separate `*Form` interface and `*FormSchema` (one per file, `BarFooForm.ts`) holding only the editable fields, built from the shared schema by `safeExtend` so a constraint the server adds reaches the form without being copied.

**A field with no `title` is labelled by its own key**, so renaming the field renames the control the reader sees; a rename that only fixes the identifier carries a `.meta({ title })` holding the old label. Titles written as enum values are prettified by `zodToJsonSchema` — `FooType.ConvertTo` reads "Convert To".

## `layout` meta is typed data

A field that wants more than its type draws says so in `.meta({ layout })`, typed by `SchemaFormLayout` (`apps/web/shared/models/schemaForm/SchemaFormLayout.ts`) and declared on `GlobalMeta` in `apps/web/shared/types/zod.d.ts`:

- **`isMultiline: true`** — text over several lines.
- **`itemsKey`** — a choice among items the dialog hands the form in its context, named by a key of that context's interface through its `PropertyNames`, never a string written by hand:

```ts
export const ColumnFormContextPropertyNames = getPropertyNames<ColumnFormContext>();
sourceColumnId: z.string().meta({ layout: { itemsKey: ColumnFormContextPropertyNames.numberColumnItems } }),
```

A string field with an `itemsKey` is one choice; an array of strings with one is several. The context is an interface of `UiSelectItem` lists in `app/models/<feature>/<Name>FormContext.ts`, and the composable both the create and edit dialogs share builds it (`useColumnForm`).

## A cross-field rule is a refinement

A check that needs values outside the field — a column name unique among the sheet's — is a `superRefine` on the form schema, built where the live values are, by the same composable that builds the context, with the issue's `path` naming the field it is about. The dialog passes the refined schema as the form's `validation-schema` and to its error icon, so the field and the dialog's save agree. There is no validation keyword and no rule in the JSON Schema.

## Unions

- **Every variant carries `.meta({ title })`** on the variant object, which the variant choice lists; without one it reads the variant's discriminant.
- **Each variant fixes its discriminant with `z.literal`.** The form picks the variant whose constant the data carries and hides the constant's own field, so an enum discriminant, which fixes nothing, cannot say which variant the data is in.
- **Pass the discriminated union straight to the form.** Switching a variant keeps the fields the variants share and anything the schema does not describe, such as a column's id, and drops the old variant's own (`getSchemaFormVariantValue`).
- **`*TypeFormSchemaMap` narrows a value to one variant's fields**, for the dirty check (`extractSchemaFields`), never to choose the form schema. It lives in the union's file and maps each discriminant to its own variant schema.

## Snapshot tests

Every schema passed to `zodToJsonSchema()` gets a `toMatchInlineSnapshot()` test beside it, filled by `pnpm vitest run --update`. Watch for the nested-pipe trap when a field's constraints go missing from the snapshot — the `zod` skill owns it.
