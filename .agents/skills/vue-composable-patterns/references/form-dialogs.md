# Wiring an entity-editing dialog

Read when a dialog edits an entity: a selector that switches which schema renders, a reset when the type changes, a validation rule that needs live component state inside a schema form, or the dialog's initial data load. Which validation layer to pick at all is in `SKILL.md`.

## A rule on live state is a refinement built where the state is

A schema form validates with its Zod schema, so a rule that reads live component state — a name unique among the
sheet's other columns — is a `superRefine` on the form schema, built in the composable the create and edit dialogs
share, with the issue's `path` naming the field. The dialog hands the refined schema to the form's
`validation-schema` and to its error icon. Reference wiring: `useColumnForm`. The schema-form rules are the
`ui-library` skill's `references/schema-forms.md`.

## Schema-controlling selectors go in `#prepend-form`

When a dialog has a selector (column type, chart type) that controls **which schema** a schema form renders, put it in the `#prepend-form` slot — not the default slot alongside schema content. `StyledEditFormDialog` renders `#prepend-form` above the `v-form`, so the selector isn't part of the form it reshapes. Canonical: `Dashboard/Visual/Preview/EditFormDialog.vue`.

```vue
<!-- WRONG: type selector mixed into default slot with the schema form -->
<StyledEditFormDialog ...>
  <UiSelect v-model="fooType" :items="fooTypeItems" label="Type" />
  <UiSchemaForm v-model="editedFoo" :schema="jsonSchema" />
</StyledEditFormDialog>

<!-- RIGHT: type selector in #prepend-form -->
<StyledEditFormDialog ...>
  <template #prepend-form>
    <UiSelect v-model="fooType" :items="fooTypeItems" label="Type" />
  </template>
  <UiSchemaForm v-model="editedFoo" :schema="jsonSchema" />
</StyledEditFormDialog>
```

## Type-driven state reset: watch + create map

When a "discriminant" ref (type selector) changes and should **reinitialize** a related mutable ref, `watch` it and rebuild through a **create map** in `services/` keyed by the discriminant, each entry a `create` taking a `Partial` of the target minus its discriminant. The map's shape (`as const satisfies` over a mapped type, so each key returns its own subtype) is the `typescript` skill's discriminant-keyed-map rule; the per-type form schemas it pairs with are the `ui-library` skill's `references/schema-forms.md`.

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

```ts
// fetch once on mount — never re-fetch on every dialog open
const { readFoos } = useReadFoos();
await readFoos();
```

The one-time `await readFoos()` in `<script setup>` handles opening the dialog without having visited the foo page first; the store then stays fresh via subscriptions.
