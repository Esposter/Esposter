# Wiring an entity-editing dialog

Read when a dialog edits an entity: a selector that switches which schema renders, a reset when the type changes, a validation rule that needs live component state inside a Vjsf form, or the dialog's initial data load. Which validation layer to pick at all is in `SKILL.md`.

## Injecting a reactive Ajv keyword

A rule can't live in a JSON schema as a closure, so the schema _declares_ the keyword and the component _injects_ the validate function at runtime:

1. Declare the keyword (`services/ajv/keywords/`) — `{ keyword, schemaType, type } as const satisfies KeywordDefinition`, no `validate`.
2. Tag the field in the Zod schema via `.meta({ [fooKeywordDefinition.keyword]: true })`, and declare the key on `GlobalMeta` in `shared/types/zod.d.ts`.
3. In the form-options composable, spread the definition and add the reactive `validate` into `ajvOptions.keywords`; the component passes the result as `:options` to `<Vjsf>`.

Reference wiring: `uniqueColumnNameKeywordDefinition` + `useColumnFormOptions` + `useUniqueColumnNameKeywordDefinitionValidation`.

## Schema-controlling selectors go in `#prepend-form`

When a dialog has a selector (column type, chart type) that controls **which Vjsf schema** renders, put it in the `#prepend-form` slot — not the default slot alongside schema content. `StyledEditFormDialog` renders `#prepend-form` above the `v-form`, so the selector isn't part of the form it reshapes. Canonical: `Dashboard/Visual/Preview/EditFormDialog.vue`.

```vue
<!-- WRONG: type selector mixed into default slot with Vjsf -->
<StyledEditFormDialog ...>
  <v-select v-model="fooType" label="Type" ... />
  <Vjsf v-model="editedFoo" :schema="jsonSchema" />
</StyledEditFormDialog>

<!-- RIGHT: type selector in #prepend-form -->
<StyledEditFormDialog ...>
  <template #prepend-form>
    <v-select v-model="fooType" label="Type" ... />
  </template>
  <Vjsf v-model="editedFoo" :schema="jsonSchema" />
</StyledEditFormDialog>
```

## Type-driven state reset: watch + create map

When a "discriminant" ref (type selector) changes and should **reinitialize** a related mutable ref, `watch` it and rebuild through a **create map** in `services/` keyed by the discriminant, each entry a `create` taking a `Partial` of the target minus its discriminant. The map's shape (`as const satisfies` over a mapped type, so each key returns its own subtype) is the `typescript` skill's discriminant-keyed-map rule; the per-type form schemas it pairs with are the `vjsf` skill's.

```ts
const fooType = ref(FooType.Bar);
const editedFoo = ref(FooTypeCreateMap[FooType.Bar].create());

watch(fooType, (newType) => {
  const { name } = editedFoo.value; // preserve fields that survive the type switch
  editedFoo.value = FooTypeCreateMap[newType].create({ name });
});
```

For **external sync** (a parent can reset the model), add a second watch on the model's discriminant field writing back into the local type ref.

- Always initialize the local type ref from the current model value, not a hardcoded default.
- `if (newType === oldType) return;` in a watch callback is always redundant — Vue only fires when the value changes.
- A writable computed is NOT the right tool here — it requires a backing `_ref` and still needs an external sync watch when a parent can reset the model.

## Dialog data loading

**Do NOT re-fetch on every dialog open.** Trust the Pinia store as source of truth — CRUD flows through tRPC subscriptions which keep the store current. Fetch once on mount; subsequent opens use cached store data.

```typescript
// fetch once on mount — never re-fetch on every dialog open
const { readFoos } = useReadFoos();
await readFoos();
```

The one-time `await readFoos()` in `<script setup>` handles opening the dialog without having visited the foo page first; the store then stays fresh via subscriptions.
