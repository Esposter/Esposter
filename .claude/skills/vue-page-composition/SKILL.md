---
name: vue-page-composition
description: Esposter Vue page and list composition — pages as layout-only orchestrators, maximal component granularity (one action per component) and when not to over-extract, array + v-for over hardcoded list items, shared list-item shells with an action slot, permission-filtered action items via a composable, one affordance per action, and singleton dialogs driven by a store target instead of per-item dialogs. Apply when decomposing a page, building a list/table of repeated items, wiring row or menu actions, or mounting a dialog for list items.
---

# Vue Page & List Composition (Esposter)

How pages and lists are assembled from components. How an individual component is _written_ — shell primitives, generics, slots, props, emits, naming — is the `vue-component-patterns` skill's.

## Page Decomposition — Pages are Layout + Composition

Pages (`pages/**/*.vue`) should be **presentation-only orchestrators**: layout structure, `<Head>`, `definePageMeta`/`defineRouteRules`, and composed sub-components. All action logic, validation, and reactive state live in the sub-components or composables they own.

**Rule:** If a page contains a `ref`, `computed`, or named function belonging to a single interactive element (a button, a form), extract that element into its own component. The page's `<script setup>` should read like a bill of materials — imports and metadata, nothing else.

```vue
<!-- WRONG: page owns the action logic and its loading state -->
<script setup lang="ts">
definePageMeta({ middleware: "auth" });
const isCreating = ref(false);
const startFoo = async () => { ... };
const fooCode = ref("");
const canJoin = computed(() => ...);
</script>

<!-- CORRECT: page delegates entirely to focused sub-components -->
<script setup lang="ts">
import { FooFeatures } from "@/services/foo/FooFeatures";
definePageMeta({ middleware: "auth" });
</script>
<template>
  <FooStartButton />
  <FooJoinForm />
  <FooFeatureCard v-for="feature of FooFeatures" :key="feature.title" :="feature" />
</template>
```

- **Button components** — own their loading state (`isCreating`, `isDeleting`), the async action, and navigation. Template is just `v-tooltip` + `v-btn`.
- **Form components** — own their field refs, validation computeds, and submit handler. Template is the `v-form` block.
- **Constant arrays** (feature lists, nav items) — live in `services/<domain>/`, never inline in the page.

## Maximal Component Granularity — One Action per Component

Default to the **smallest coherent unit**. Each component should be stupid simple — ideally one component maps to one action / function / concern. This applies to **any** component, not just buttons: whenever a part of a component has its own distinct responsibility, extract it.

### Extract every action control into its own component

An action button is **not** a leaf — it owns logic. Extract each `v-btn` (with its `v-tooltip`, its click handler, and the store access it needs) into its own component, so the list item / page keeps no action logic:

```vue
<!-- ❌ list item owning 4 inline tooltip+btn blocks and their handlers -->
<!-- ✅ list item is pure layout; each button owns its action end to end -->
<v-list-item>
  ...
  <FooDeleteButton :foo />
  <FooEditButton :foo />
  <FooSendButton :foo />
</v-list-item>
```

The button component holds its own store wiring, and its single-use handler stays **inline in the template** (the `vue` skill's inline-handler rule) — don't extract it to a named script function.

- **List items / rows reduce to pure layout** — avatar, title, subtitle, time, and a row of extracted button/menu components.
- **A button with a keyboard shortcut is its own component** owning both the `v-btn` and the `onKeyStroke` handler — never wire the shortcut in the parent.
- **A `v-menu` and its items is one component** — the menu plus its list items are one coherent unit.
- **Multi-step logic reused by 2+ buttons** goes into a `use*` composable. A composable is reuse, not single-use extraction — it doesn't violate the inline-handler rule.

### Allowed grouping (do NOT split these)

Keep together only when items are genuinely the same logic: buttons/items rendered via `v-for` over a config array (PascalCase, in `services/<domain>/`), or a coherent group driven by one config (a `v-tabs` from a `tabs` array, an icon-button toolbar from a `computed` array).

**`v-for` does not exempt the item body.** Iterating is shared structure; per-item _logic_ is not. If each iterated item carries its own handler, store wiring, or multi-step logic, the item body becomes **its own component** rendered inside the `v-for` — the parent's loop stays pure layout. Only inline the item body when it is a plain prop spread with no own logic.

### Do NOT over-extract

Granularity must **simplify the problem** or enable **reuse**. Skip refactors that do neither:

- A wrapper that only forwards props/attrs and needs `inheritAttrs: false` plumbing just to make a click reach the inner element is an anti-pattern — inline the `v-tooltip` + `v-btn` instead.
- Don't extract a component that is used in exactly one place and removes no logic from its parent (pure passthrough). Extract when the child owns a distinct responsibility (an action, a form, a self-contained piece of layout), not to hit a line count.

## List Item Rendering: Array + v-for over Hardcoded Items

**Never hardcode repeated `<v-list-item>` (or any list item) elements** when they share the same structure — extract to an array and render with `v-for`.

The array lives in `services/<domain>/` (co-located with the component's feature folder), not inline. **Constant arrays use PascalCase names.**

```ts
// services/foo/FooItems.ts — array defined here, imported by components/Foo/List.vue
export const FooItems = [
  { value: "read", title: "Read", prependIcon: "mdi-eye" },
  { value: "write", title: "Write", prependIcon: "mdi-pencil" },
] as const;
```

```vue
<!-- CORRECT: import array from services/, v-for in template -->
<script setup lang="ts">
import { FooItems } from "@/services/foo/FooItems";
</script>
<template>
  <v-list>
    <v-list-item v-for="{ value, title, prependIcon } of FooItems" :key="value" :value :title :prepend-icon />
  </v-list>
</template>
```

When the items **are** an enum with no extra per-item data, iterate the enum directly instead of mirroring it into an array — but hoist the `Object.entries` call to a script-setup `const` (see the `vue` skill's render-position rule).

**Sub-case — icon buttons with tooltips.** Repeated `v-tooltip` + `v-btn` blocks are the same pattern with a reactive array: the items live in a `computed` (in a composable) rather than a module constant, because icon/color/tooltip text depend on state. The template is still one `v-for` over the computed, destructuring the item into the `v-btn`.

**When to apply:**

- 3+ list items with the same props shape — always extract
- 2 items — extract if they'll grow or props are non-trivial
- Items differing in non-trivial ways (different slots, conditional logic) — keep separate or use a dispatcher child
- Items rendering fundamentally different components (a delete dialog vs a generic form dialog with unique slot content) — never extract; the template structure diverges too much for a shared shape

## Shared List-Item Shell with an Action Slot

When **multiple list components** (different data sources/stores) render the same item layout but need **different trailing actions**, extract the shared shell into one item component with a named `#append` slot. Distinct from the array + `v-for` pattern above: there a single array drives the rows; here only the shell is shared.

```vue
<!-- shared shell: prepend + title fixed, actions via slot -->
<v-list-item :title="name">
  <template #prepend><v-avatar size="36" mr-3>...</v-avatar></template>
  <template #append><slot name="append" /></template>
</v-list-item>

<!-- each list supplies only its buttons -->
<FooUserListItem v-for="{ id, name, image } of foos" :key="id" :image :name>
  <template #append><v-btn text="Remove" @click="$trpc.foo.deleteFoo.mutate(id)" /></template>
</FooUserListItem>
```

Trigger: the same `v-list-item` + prepend block copy-pasted across 2+ lists.

### Shell attrs passthrough

When the shell's consumers need different root interactions (one passes `@click`, another `tabindex`), do NOT add props for them — declare `defineOptions({ inheritAttrs: false })` and spread onto the actual interactive element: `<v-list-item :="{ ...props, ...$attrs }">` (here `props` comes from a wrapping `v-hover` slot). Render optional chrome only when the consumer supplies it: `v-if="$slots.default"` around the hover/focus action toolbar. Use VueUse `useFocusWithin(useTemplateRef(...))` for focus-visibility instead of hand-rolled focusin/focusout handlers (a `@ts-expect-error TS2590` may be needed on Vuetify component refs).

## Permission-Filtered Action Items: Composable + v-for

When list items or icon buttons are guarded by `v-if` permission checks, **move filtering into a composable** — the template gets a plain `v-for` with no conditions.

Use the existing `Item` type (`@/models/shared/Item`) for the array element shape — never re-declare an inline `{ title, icon, … }` shape, in a component or in a UI metadata map. `Item` carries `title`, `icon`, optional `color`/`active`/`shortTitle`, and an optional `onClick`, so it covers both display-only metadata and actionable menu items. Reach for a narrower interface only when it matches exactly — `SelectItemCategoryDefinition<T>` (value), `ListItemCategoryDefinition<T>` (value + icon). The composable reads permissions from stores internally; only pass per-item runtime data (e.g. `userId`, `isMuted`) as getter arguments.

```ts
// composables/feature/useFeatureActionItems.ts
import type { Item } from "@/models/shared/Item";

export const useFeatureActionItems = () => {
  const canDoA = computed(() => /* permission check */);
  const canDoB = computed(() => /* permission check */);

  const getActions = (targetId: string, someState: boolean): Item[] => {
    const items: Item[] = [];
    if (canDoA.value && !someState)
      items.push({ icon: "mdi-x", title: "Action A", onClick: () => doA(targetId) });
    if (canDoB.value)
      items.push({ icon: "mdi-y", title: "Action B", onClick: () => doB(targetId) });
    return items;
  };

  return { canDoA, canDoB, getActions };
};
```

```vue
<!-- CORRECT: filtered array from composable, single v-for -->
<v-list-item
  v-for="{ icon, title, onClick } of getActions(id, someState)"
  :key="title"
  :prepend-icon="icon"
  :title
  @click="onClick"
/>
```

## One Affordance Per Action — No Duplicate Behaviour

**Every action gets exactly one visible way to trigger it.** Two controls that do the identical thing are not "convenience" — they make the user stop and ask whether the two differ, and they double the surface that has to stay in sync.

When you find duplicates, keep the affordance with the **largest hit target and the least chrome**, and delete the rest — in a table row that is the row click itself, so a name cell and an open button pointing at the same route both go:

```vue
<!-- WRONG — the name link and the Open button both repeat the row click -->
<template #[`item.name`]="{ item }">
  <NuxtLink text-info :to="RoutePath.Foo(item.id)" @click.stop>{{ item.name }}</NuxtLink>
</template>
<template #[`item.actions`]="{ item }">
  <StyledTooltipIconButton icon="mdi-open-in-new" text="Open" :to="RoutePath.Foo(item.id)" />
</template>

<!-- CORRECT — row click navigates; the name is plain text (drop the slot entirely), actions hold only what the row click can't do -->
<template #[`item.actions`]="{ item }">
  <StyledOverflowMenu :items="getActionItems(item)" @click.stop />
</template>
```

Corollaries:

- **Don't style non-links like links.** `text-info` + underline is a promise of a distinct navigation target. If the row already navigates, the name is plain text — styling it as a link implies it goes somewhere else.
- **A different trigger for the same command is not a duplicate.** A right-click context menu and a row `⋮` menu are two triggers for one list of commands — that is fine, and they must be driven by **one** shared `Item[]` (see [Permission-Filtered Action Items](#permission-filtered-action-items-composable--v-for)). What is banned is a second _visible_ control for a command that already has one.
- **A genuinely different behaviour is not a duplicate.** `Open in new tab` survives next to row-click because it does something row-click cannot.
- If a slot exists only to re-render the default value (`{{ item.name }}`), delete the slot and let the default rendering do it.

## Singleton Dialogs — Store-Driven Target, Never Per-Item

**Never mount a dialog (or any heavy overlay subtree) inside a list item.** A `v-for` over N items with an embedded `v-dialog`/menu creates N full component trees that all mount, hydrate, and re-render together — which is how a list page ends up with a seconds-long INP. The full rationale and canonical wiring live in `packages/app/content/docs/architecture/singleton-dialogs.md`; keep that page updated when this pattern evolves.

The pattern (three parts):

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
