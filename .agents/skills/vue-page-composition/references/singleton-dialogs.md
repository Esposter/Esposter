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

**A dialog that resolves its own item passes the resolver to `useSingletonDialog` — never a parallel lookup computed of its own.** The second argument is what reconciles the target against the list, and skipping it is not a style choice, it is the bug the primitive exists to prevent: with `v-if="item"`, a search, a page turn or an optimistic removal takes the row out of the list and unmounts the dialog mid-edit while the target ref stays set, so the dialog **re-opens by itself** over that row the moment a later read brings it back.

```ts
// The resolver, so a target whose item is gone is dropped with it
const { isOpen, item } = useSingletonDialog(deletingId, () => getFoo(deletingId.value));
// A separate `const item = computed(() => getFoo(deletingId.value))` alongside a resolver-less call is the defect
```

Omit the second argument only when the **parent** owns the lookup and hands the item down as a prop — there the parent resolves and the dialog uses `isOpen` alone. Either the dialog resolves or its parent does; nobody resolves twice.

- When the dialog needs per-open local state (a `structuredClone` edit draft), mount it `v-if`-guarded **with a `:key`** at the list level so it re-creates per target: `<FooEditDialog v-if="editingFoo" :key="editingFoo.id" :foo="editingFoo" />`.
- Hover toolbars / options menus in list items follow the same idea with `v-if` (mount on hover), not `v-show`.
- Single-instance dialogs (one create button per toolbar, one settings dialog per page) may keep the button+dialog combined component — the rule targets per-item multiplication.
