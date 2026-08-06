# Form bindings and upsert forms

Read when an input needs the split `:model-value` + `@update:model-value` form instead of `v-model`, or when a form handles both create and edit.

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
interface PostUpsertFormProps {
  initialValues?: Pick<Post, "description" | "title">;
  isCreate?: boolean;
}
const { initialValues = { description: "", title: "" }, isCreate = false } = defineProps<PostUpsertFormProps>();
const values = ref(initialValues);
```

- Template binds to `values.title` etc. (auto-unwrapped); emit passes `values` directly.
- `isCreate` drives button text: `isCreate ? 'Post' : 'Edit Post'`.
- Create page passes `is-create`; update page passes `:initial-values` (no `is-create`).

The same `isCreate?: boolean` pattern applies to dialog buttons (e.g. `CrudView/EditDialogButton`), where it also skips the equality check that would disable the save button when state matches the original.
