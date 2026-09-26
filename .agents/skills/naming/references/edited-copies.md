# Edited Copies

Read when naming a local editable copy of a prop or a store field — a form draft, a buffered input.

- `edited{PropName}` for a **local editable copy** of a prop/store field (form drafts, buffered inputs) — the value a field's `v-model` binds to before save: `editedName` (copy of `resource.name`), `editedRow`, `editedImage`. Never `{prop}Value` (`renameValue` ✗) nor a bare restatement of the field. Holds whether the copy is a plain `ref(source)` or a `useCloned(() => source)` — the prefix marks it as the draft, not the source of truth
