# Schema form bindings of the app's own

## Why

The schema form already owns its root, its dispatch and every renderer; what it still takes from `@jsonforms/vue` is the binding layer, the composables that map JSON Forms' core state to a renderer's props. Those composables read the state through `provide` and `inject`, which is why the form's root carries the one injection the app allows, and they bring their own lodash. Each is a call to a mapping function `@jsonforms/core` already exports.

## What Changes

- Each renderer maps the core's state to its props by calling `@jsonforms/core`'s own mapping functions, through the one control composable the fields share.
- The form's state and dispatch are passed down to each node as a prop, so the form's root provides nothing and no renderer injects.
- A node no renderer draws is skipped without stopping the form.
- `@jsonforms/vue` leaves the catalog and the ledger, and the Vue skill's injection exception for JSON Forms goes.

## Capabilities

- **architecture/schema-forms** (modified)

## Waiting on

None.

## Impact

- `apps/web/app/components/Ui/SchemaForm/` and `apps/web/app/composables/ui/useSchemaFormControl.ts`.
- `apps/web/app/models/ui/UiSchemaFormRendererProps.ts`.
- `.agents/skills/vue/SKILL.md`, the catalog, the lockfile and `.agents/ledgers/dependencies.md`.
