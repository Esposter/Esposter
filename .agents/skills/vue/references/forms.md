# Form bindings and upsert forms

Read when an input needs the split `:model-value` + `@update:model-value` form instead of `v-model`, when a form handles both create and edit, or when deciding what validates a field.

## When the split binding is justified

Default to `v-model="ref"`. Keep the split form only when the update is not a direct assignment to a single ref:

- **Computed get** — `:model-value` derives from more than a bare ref (e.g. `a?.b ?? c`).
- **Multiple writes on update** — the handler sets more than one ref.
- **Extra-arg function call** — `@update:model-value="setFilter(key, $event)"`.
- **Dynamic property assignment** — `@update:model-value="row[col] = $event"`.
- **Genuine value transformation** — unit/date-format conversion, bitwise ops (the stored value differs structurally from the displayed one).

## Upsert forms — create vs edit mode

When a form handles both create and edit, use an explicit `isCreate` prop (default `false`) rather than deriving mode from `initialValues`. The parent passes `is-create` explicitly. Use a single `values` ref over per-field refs:

```ts
interface Props {
  initialValues?: Pick<Foo, "bar" | "baz">;
  isCreate?: boolean;
}
const { initialValues = { bar: "", baz: "" }, isCreate = false } = defineProps<Props>();
const { cloned: values } = useCloned(() => initialValues);
```

- **`useCloned`, never `ref(initialValues)`** — a bare `ref` makes the prop's own object the editable state, so the first keystroke mutates the parent's row before anything is saved, and it never resyncs when the source changes. The `sync`/`clone` options are in `references/watch-decision-tree.md`.
- Template binds to `values.bar` etc. (auto-unwrapped); emit passes `values` directly.
- `isCreate` drives button text: `isCreate ? 'Create Foo' : 'Edit Foo'`.
- Create page passes `is-create`; update page passes `:initial-values` (no `is-create`).

The same `isCreate?: boolean` pattern applies to dialog buttons (e.g. `Foo/EditDialogButton`), where it also skips the equality check that would disable the save button when state matches the original.

## A settings draft is the form's, not the row's

A settings panel that saves on blur binds **local refs seeded from the row**, never a clone of the row and never
the row itself. The optimistic write rolls the row back when the server rejects it; the controls deliberately
keep what the user typed, with `isDirty` still true, so the next blur retries it. The panel is still on screen
beside the alert, which is what makes that draft worth keeping — a form that reset itself to the rolled-back row
would throw the edit away at the moment the user most wants it.

## Never normalize in Vue — trust the server schema

**Never apply `normalizeString` (or any trimming) anywhere in Vue** — not in `@update:model-value`, not in submit handlers. tRPC input schemas already normalize, and trimming as the user types swallows spaces mid-word. Let raw input flow through `v-model="name"`. It stays valid outside forms (text parsing, CSV/XLSX deserialization, slash commands) — anything not crossing a tRPC Zod boundary.

Validity checks `safeParse` the shared schema (`:disabled="!nameSchema.safeParse(name).success"`); dirty-state comparisons parse **both** sides (`topicSchema.safeParse(editedTopic).data !== topicSchema.safeParse(storedTopic).data`), since a stored value the schema would normalize otherwise reads as dirty the moment the form opens; submit handlers pass raw values with no guards, emptiness checks or local normalization. The only client-side validation is that disabled state plus Vuetify field rules for inline errors.
