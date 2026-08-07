---
name: vue-component-patterns
description: Esposter Vue 3 component authoring — the shared Styled/App shell primitives (StyledPageHeader one per route, StyledEmptyState, StyledSkeleton, StyledSearchDialog, AppBreadcrumbs) and registering a new product, same level of abstraction in script setup, selection read from the store instead of threaded props, :key-remount and props-down initialisation of local state, the wrapper + pure-child pattern for async data, useCloned for local copies, is-prefixed boolean props typed as the non-default literal, present-tense emit names, the folder-path-is-the-prefix naming rule, defineSlots on every component that renders a slot, plus deep dives on generic SFCs and per-variant prop/model typing, component folder naming with Nuxt auto-import name collapse, and slot declaration, conditional forwarding and extraction. Apply when writing, typing, naming, or refactoring an individual Vue component.
---

# Vue Component Patterns (Esposter)

## Deep dives

- `references/props-and-generics.md` — when a prop or model type depends on an enum/discriminant key, when one component is absorbing several data variants, or when a boolean prop has a default.
- `references/component-naming.md` — when creating, renaming or moving a component file, when a directory of components gets crowded, or when a tag renders empty with no error.
- `references/slots.md` — when a component declares a slot, forwards an optional slot into a library component, or a named slot's content has grown non-trivial.

## Shared Shell / Design-System Primitives

Cross-product chrome is a small set of shared components in `components/Styled/` (design-system) and `components/App/` (app-chrome) — **reuse them, never re-roll a bare `v-toolbar` per editor.** Their design and rationale live in `packages/app/content/docs/platform/shell-cohesion.md`; keep that spec live in the same change when you add or alter a shell primitive.

- `StyledPageHeader` — the canonical editor/page header (breadcrumb row + `actions` slot + `controls` slot). Every editor header mounts document picker / selects / search through it; controls never go inside `v-toolbar-title`. **One per route** — its `breadcrumbs` slot falls back to `<AppBreadcrumbs :title />`, so a second one nested under a page that already has one renders a second, title-less trail. A toolbar _inside_ a page — a resource blade, a card header — is a plain `v-toolbar` (`px-4 py-2 b-b-1 b-border b-solid flex flex-wrap gap-2 items-center`, `v-spacer` before the trailing actions).
- `StyledEmptyState` — icon + title + description + action slot for empty lists/states.
- `StyledSkeleton` — bordered `v-skeleton-loader` for per-region loading.
- `StyledSearchDialog` — the canonical Ctrl+K search palette (dialog + solo autofocus search field + `hotkey` prop registered via `useVHotkey`, `activator` slot, results in the default slot). Every dialog-style search UI mounts through it — never re-roll a `v-dialog` + `v-text-field` + hotkey listener (`onKeyStroke`/`useEventListener`) per feature. See `docs/architecture/search.md`.
- `AppBreadcrumbs` — route→product trail (matched against `ProductListLinkItems`), rendered by `StyledPageHeader`.

When a new product/editor is added, give its **page** a `StyledPageHeader`, a launcher entry in `ProductListLinkItems`, and — if it is resource-backed — an entry in `ResourceDefinitionMap` (`shared/services/resource/`), the single map carrying each resource type's `icon`, `title`, and route for the `/resources` hub. Document the result in the shell-cohesion spec.

## Same Level of Abstraction

Every statement in `<script setup>` must operate at the same conceptual level. **If one line calls a composable encapsulating a concept, all other lines should be at that same call-site level** — not implementing sub-steps inline.

**Signals abstraction levels are mixed:**

- A store or composable call sits next to a manual `ref` + `computed` + `watch` block implementing the same concept (e.g. a `selectedFooId` ref plus a lookup computed plus a watch pruning stale selections, beside a `useFooStore()` that already owns selection).
- A `v-if="x"` guard exists only so the template body can skip absence checks (extract to a child component receiving a required prop instead).
- Inline `watch` callbacks contain multi-step logic that belongs in a composable.

**Fix:** move the lower-level block to its owner — a store (selection state, shared reactive data — see the `pinia` skill) or a `use*` composable — then call it at the same level as everything else.

## Selection State: Read the Store, Don't Thread Props

Once the selection lives in the store, children read it directly. This drops both the prop chain and the emit chain — a list item binds `:active="foo.id === selectedFooId"` from `storeToRefs` and calls `selectFoo()` itself, instead of the parent passing `:selected-foo-id` down and handling `@select` back up.

When a child has **local mutable state initialized from a prop**, don't watch the prop to reset it — use `:key` so the child remounts and re-initializes from the fresh prop:

```vue
<!-- ❌ watch(() => foo.fields, (newFields) => { fields.value = newFields; }) in FooEditor -->
<!-- ✅ :key remounts FooEditor on selection change -->
<FooEditor v-if="selectedFoo" :key="selectedFoo.id" :foo="selectedFoo" />
```

**Prefer props-down when the parent is adjacent and already has the data** — the child initializes its ref from the prop (`const { fooId } = defineProps<Props>(); const selectedFooId = ref(fooId);`), no watch, no store duplication. Only pass through an intermediate generic router component if the prop is truly shared by all children; if only one leaf needs it, keep the store read in that leaf and initialize its ref directly.

## Async Data: Wrapper + Pure Child Pattern

When a component needs async/reactive data (e.g. a store that populates after mount), split into:

- **`Index.vue` (wrapper)** — owns the data lookup + the `v-if` guard; pure orchestration.
- **`Form.vue` (pure child)** — receives the data as a **required** prop and initializes local state once, synchronously; no store access for the guarded data.

This avoids async races where a `ref` initialized once at setup time (before the store is populated) silently overwrites real data with `""`.

```vue
<!-- Index.vue — wrapper owns the lookup and v-if guard -->
<template>
  <FooForm v-if="foo" :foo :parent-id />
</template>

<!-- Form.vue — pure: prop is guaranteed non-undefined, so the ref init is safe -->
<script setup lang="ts">
const { foo, parentId } = defineProps<{ foo: Foo; parentId: string }>();
const bar = ref(foo.bar);
</script>
```

**When to apply:** any component that reads from a store/API and initializes a local editable `ref` from that data, where the store can be empty at component creation time.

## Local Copies of Reactive Sources

A local editable copy of a reactive source is always VueUse `useCloned`, never `ref` + `watch` — see the `vue` skill's Watch Decision Tree, which owns the rule and the `sync`/`clone` options.

## Boolean Props — `is` Prefix + Default-Aware Literal Typing

- **`is` prefix.** Boolean props read as a question: `isDense`, `isInteractive`, `isOpen` — never bare `dense` / `interactive` / `open`, and never `can*` / `should*` (prefer `is`, fall back to `has`; see global naming rules). The same applies to `defineModel` / emit payloads.
- **Type as the non-default literal, not `boolean`**, so passing the default is impossible: defaults-false → `?: true` (caller opts in with the bare attribute), defaults-true → `?: false` with a destructure default `= true`. Derived values, and the one exception for a genuinely two-way boolean, are in `references/props-and-generics.md`.

## Emits — Present-Tense Event Names

Emit names are **present-tense verbs**: `delete`, `update`, `create`, `save`, `submit` — never past tense (`deleted`, `updated`, `copied`). The event names the action the parent should handle, not a completed fact; past-tense names also drift from Vue/DOM convention (`click`, `submit`, `change`).

For state-sync emits, use the `update:x` form where `x` is the state name (`"update:copied": [boolean]`) — the verb stays present tense; the state name may be any shape.

## Component Folder Naming

**The folder path is the prefix — never repeat it in the filename.** Nuxt builds the auto-import name from the directory words plus the filename words, so `Feature/Group/ItemCard.vue` → `FeatureGroupItemCard`, and `Index.vue` contributes nothing (`Group/Index.vue` → `FeatureGroup`). Because a filename's leading words that repeat the folder path's trailing run are emitted **only once**, two files can silently generate one name and the un-collapsed tag renders **empty with no error** — when to fold a shared prefix into a folder, the collapse rules and their carve-outs are in `references/component-naming.md`.

## File Length

Line-count target and exceptions — see the `file-organization` skill. Component-specific extractions when a `.vue` runs long: pull toolbar/header buttons into a slot component (e.g. `TopSlot.vue`), row/column action menus into `ActionSlot.vue`, and grouped controls into their own focused component.

## Slots

**Every component that renders a `<slot>` declares `defineSlots`** — typed slot contracts, same as props (`defineSlots<{ default: () => VNode }>()`; `?:` when the consumer may omit it). Forwarding an _optional_ slot into a library component that falls back to a prop needs `#default` + `v-if` on the same template, and extracting a non-trivial slot's content into its own component follows a naming convention — both in `references/slots.md`.

## Page & List Composition

Decomposing a page into components, rendering repeated list items from an array, sharing a list-item shell, permission-filtered action items, one affordance per action, and singleton dialogs are the `vue-page-composition` skill's.
