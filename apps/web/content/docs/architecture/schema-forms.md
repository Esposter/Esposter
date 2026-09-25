---
title: Schema forms
description: How a form generated from a Zod schema is drawn — JSON Forms' core lays out the JSON Schema the app generates, the UI library draws every node of it, and the Zod schema validates it — why the engine was adopted and its Vue shell written, and what AJV is still there for.
---

# Schema Forms

The sheet's settings, its column create and edit dialogs and the dashboard's visual editor render their forms from a Zod schema. `zodToJsonSchema` turns the form schema into JSON Schema, and `UiSchemaForm` renders that: [JSON Forms](https://jsonforms.io/)' core lays it out and keeps every nested value in step, the library's own components draw every node, and the Zod schema the form came from is what validates it.

## How a form is drawn

```mermaid
flowchart TD
  Z[The form's Zod schema] --> J[zodToJsonSchema]
  J --> F[JSON Forms' core, its own validation off]
  F --> D{UiSchemaFormDispatch, by rank}
  D -->|a fixed value: a variant's discriminant| H[Nothing drawn]
  D -->|an enum, a titled enum, a field naming a context key| S[UiSelect, one value or several]
  D -->|a union of objects| O[The variant choice, over the chosen variant's fields]
  D -->|a string or a number| T[UiTextField, one line or several]
  D -->|a boolean| C[UiCheckbox]
  D -->|a layout or a nested object| L[The fields stacked, framed under a label when nested]
  D -->|an array| A[A card per item, added, moved and removed]
  L --> D
  A --> D
  S --> W[The value written at the field's path]
  O --> W
  T --> W
  C --> W
  W --> Q[The Zod schema validates the whole value]
  Q --> I[Each issue shown on the field at its path, once the reader has changed it]
```

- **JSON Schema is the input.** JSON Forms generates the layout from the schema where no UI schema is given, which is every form the app has, and `zodToJsonSchema`'s inline snapshot tests pin the schema each form receives.
- **The library draws every node.** `UiSchemaForm` holds JSON Forms' core state and provides it to the bindings, and `UiSchemaFormDispatch` draws each node with the renderer whose tester ranks it highest in `SchemaFormRenderers`: layouts, nested objects and arrays as well as text, numbers, booleans and choices. A new kind of node is one entry in that list. The state is shallow: JSON Forms' reducers return a new core for every change, so the replaced property is the only change to track, and the renderer components are never proxied.
- **Layout meta is typed data.** A field that wants several lines, or a choice among items only the dialog knows, says so in its `layout` meta — a flag, or a key of the dialog's context interface — never an expression string evaluated at runtime.
- **The Zod schema validates.** JSON Forms runs with its validation off. The form's Zod schema checks the whole value on every change, as the dialog's error icon does, and each issue reaches the field at its path through the form's config, shown once the reader has changed that field. A rule that reads live state, a column name unique among the sheet's, is a refinement the dialog's composable builds.
- **A variant is its discriminant.** A union's variants each fix their discriminant to a literal, which the form hides and the variant choice sets. Switching keeps the fields the variants share and anything the schema does not describe, such as a column's id, and drops the old variant's own — and a shared field the two variants pick from different lists of the dialog's context, since the new picker never offered the old choice.

## The engine is adopted, the Vue shell is ours

A schema form engine is most of the work: generating a layout from the schema, ranking each node's renderer, detecting which variant of a union the data is in, and applying every change to a nested value immutably. Writing that for a handful of dialogs would put an engine in the repository that nothing else maintains, so JSON Forms' core and the setup-only `useJsonForms*` bindings are adopted. Its Vue components are not: the `JsonForms` root keeps its state in `data()`, `DispatchRenderer` picks a renderer in a `computed`, and the vanilla renderers are written the same way, while the app compiles the Options API out. Mounted there, the root rendered off an undefined store and aborted the patch around it. So the root, the dispatch and the layout, object and array renderers are the library's own `<script setup>` components, and every Vitest run loads Vue with the Options API off (`getVueTestConfiguration`), so a component that needs it fails its test rather than the app.

| Candidate                                                                       | Why it is or is not the one                                                                                                                                                                  |
| :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON Forms' core, chosen                                                        | Renders the JSON Schema the app already generates, framework-free, with every renderer registered by rank. Maintained by EclipseSource, with the largest user base of the Vue schema engines |
| JSON Forms' Vue components and vanilla renderers, rejected                      | Written in the Options API, which the app compiles out; turning `vue.optionsApi` back on would be a whole-app cost paid for one dependency                                                   |
| vjsf, replaced                                                                  | Bound to Vuetify as a peer dependency, so Vuetify could not leave while it stayed, and its fields could not wear the library's look                                                          |
| [shadcn-vue's AutoForm](https://radix.shadcn-vue.com/docs/components/auto-form) | Walks the Zod schema itself, but it is copied into the repository rather than installed — a renderer of our own under another name — and it brings Reka UI and vee-validate beside Vuetify 0 |
| [FormKit](https://formkit.com/)                                                 | A whole form framework whose inputs, validation and schema format would replace the library's fields and the app's JSON Schema                                                               |

## AJV is JSON Forms'

JSON Forms' core imports AJV and builds an instance when a form mounts, even with its validation off, to match a union's variants. So AJV and its formats stay, as JSON Forms' own dependencies rather than the app's, and the Vite plugin that turns their CommonJS into ESM for rolldown stays with them. What went with vjsf is everything the app wrote on top: its validation keywords, its error-message and translation packages, the layout engine's `debug`, and the pre-bundle list vjsf published.

## Key files

| File                                                               | Role                                                                                |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| `apps/web/app/components/Ui/SchemaForm/Index.vue`                  | JSON Forms' core state, provided to the bindings, with the Zod issues in its config |
| `apps/web/app/components/Ui/SchemaForm/Dispatch.vue`               | Draws a node with the renderer that ranks it highest                                |
| `apps/web/app/components/Ui/SchemaForm/Layout.vue`                 | A layout's elements stacked, or framed under a label when nested                    |
| `apps/web/app/components/Ui/SchemaForm/Object.vue`                 | A nested object as its own fields                                                   |
| `apps/web/app/components/Ui/SchemaForm/Array.vue`                  | A list's items, added, moved and removed                                            |
| `apps/web/app/services/ui/schemaForm/SchemaFormRenderers.ts`       | Which renderer draws which node, by rank                                            |
| `apps/web/app/services/ui/schemaForm/getSchemaFormVariantValue.ts` | The value a union switched to another variant keeps                                 |
| `apps/web/app/composables/ui/useSchemaFormControl.ts`              | What every field reads: its layout meta and its issue                               |
| `apps/web/app/services/jsonSchema/zodToJsonSchema.ts`              | The form's JSON Schema, with its layout meta                                        |
| `apps/web/shared/models/schemaForm/SchemaFormLayout.ts`            | The layout meta a field may carry                                                   |
| `apps/web/app/composables/resource/sheet/useColumnForm.ts`         | The column dialogs' context and their refined form schema                           |
| `packages/configuration/vitest/registerVueEsmBundler.js`           | Every test's Vue with the Options API off, as the app ships it                      |
| `apps/web/configuration/plugins/fixAjv.ts`                         | JSON Forms' AJV turned into ESM for rolldown                                        |

## Sources

- [JSON Forms' core](https://github.com/eclipsesource/jsonforms/tree/master/packages/core) and [Vue binding](https://github.com/eclipsesource/jsonforms/tree/master/packages/vue): `coreReducer`, `rankWith`, the `useJsonForms*` bindings and the `NoValidation` mode.
- [JSON Schema in Zod](https://zod.dev/json-schema): the conversion the form's input comes from.
