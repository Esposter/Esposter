# Wiring a singleton dialog for a list

Read when a list item needs a dialog, menu or other overlay opened from a row, or when a dialog carries per-open local state. The rule — never mount a dialog inside a list item — is in `SKILL.md`, and the rationale in `packages/app/content/docs/architecture/singleton-dialogs.md`.

The pattern has three parts:

1. **Target ref in a per-service dialog store** — dialog UI state never lives in a business-logic store. Each service gets its own dialog store next to its business store (`store/<domain>/dialog.ts` → `use<Domain>DialogStore`) holding only targets like `deletingId` / `editingColumnName`. Targets are strings defaulting to `""` — never `undefined` (empty-string default rule).
2. **Action buttons write the target** — the per-item button is a dumb `StyledTooltipIconButton` with `@click.stop="deletingId = item.id"`. No activator slots, no emit plumbing up the tree.
3. **One dialog instance mounted at list level** — a `ConfirmDeleteDialog.vue`/`EditDialog.vue` singleton mounted once (in the list/table/page component). It resolves the full item from the business store by target, guards with `v-if="item"`, and derives its model via `useSingletonDialog`:

```ts
// composables/useSingletonDialog.ts — writable v-model over the target ref
const isOpen = useSingletonDialog(deletingId); // get: Boolean(target); set false: target = ""
```

```vue
<!-- singleton dialog: resolve item from store, v-if guard, v-model via useSingletonDialog -->
<!-- cardProps carries the header (title/subtitle/prependIcon) only — the message goes in the default slot -->
<StyledDeleteFormDialog v-if="item" v-model="isOpen" :card-props="{ title: 'Delete Foo' }" @delete="...">
  Are you sure you want to delete <b>{{ item.name }}</b>?
</StyledDeleteFormDialog>
```

- When the dialog needs per-open local state (a `structuredClone` edit draft), mount it `v-if`-guarded **with a `:key`** at the list level so it re-creates per target: `<FooEditDialog v-if="editingFoo" :key="editingFoo.id" :foo="editingFoo" />`.
- Hover toolbars / options menus in list items follow the same idea with `v-if` (mount on hover), not `v-show`.
- Single-instance dialogs (one create button per toolbar, one settings dialog per page) may keep the button+dialog combined component — the rule targets per-item multiplication.
