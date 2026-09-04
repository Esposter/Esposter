---
name: vue-component-patterns
description: Esposter Vue 3 component authoring — the shared Styled/App shell primitives (StyledPageHeader one per route, StyledEmptyState, StyledSkeleton, StyledSearchDialog, AppBreadcrumbs) and registering a new product, same level of abstraction in script setup, selection read from the store instead of threaded props, :key-remount and props-down initialisation of local state, the wrapper + pure-child pattern for async data, useCloned for local copies, a registry of heavy components holding defineAsyncComponent loaders with a Suspense boundary at every render site, is-prefixed boolean props typed as the non-default literal, present-tense emit names, the folder-path-is-the-prefix naming rule, defineSlots on every component that renders a slot, plus deep dives on generic SFCs and per-variant prop/model typing, component folder naming with Nuxt auto-import name collapse, and slot declaration, conditional forwarding and extraction. Apply when writing, typing, naming, or refactoring an individual Vue component.
---

# Vue Component Patterns (Esposter)

How an individual component is written, typed and named. Assembling a page or list _from_ components — decomposition, `v-for` items, action items, singleton dialogs — is the `vue-page-composition` skill's.

## Deep dives

- `references/props-and-generics.md` — when a prop or model type depends on an enum/discriminant key, when one component is absorbing several data variants, or when a boolean prop has a default.
- `references/component-naming.md` — when creating, renaming or moving a component file, when a directory of components gets crowded, or when a tag renders empty with no error.
- `references/slots.md` — when a component declares a slot, forwards an optional slot into a library component, or a named slot's content has grown non-trivial.

## Shared Shell / Design-System Primitives

Cross-product chrome is a small set of shared components in `components/Styled/` (design-system) and `components/App/` (app-chrome) — **reuse them, never re-roll a bare `v-toolbar` per editor.** Their design and rationale live in `packages/app/content/docs/platform/shell-cohesion.md`; keep that spec live in the same change when you add or alter a shell primitive.

- `StyledPageHeader` — the canonical editor/page header: a breadcrumb row carrying a right-aligned `status` slot (a standing readout — the storage meter), then the title beside an `actions` slot, then a `filters` row. Every editor header mounts document picker / selects / search through it; controls never go inside `v-toolbar-title`. The title row is skipped when there is neither title nor actions, so a page whose own content names it passes no title rather than repeating one. **One per route** — it renders `AppBreadcrumbs` itself, so a second one nested under a page that already has one renders a second trail and a second status readout. A toolbar _inside_ a page — a resource blade, a card header — is a plain `v-toolbar` (`px-4 py-2 b-b-1 b-border b-solid flex flex-wrap gap-2 items-center`, `v-spacer` before the trailing actions).
- `StyledEmptyState` — icon + title + description + action slot for empty lists/states.
- `StyledSkeleton` — bordered `v-skeleton-loader` for per-region loading. **A component whose parent already renders it as a `<Suspense>` fallback `await`s the data its first render needs in setup**, rather than keeping its own `isLoading` ref and skeleton branch — that is two indicators for one wait, one of them dead. Only data gating the _initial_ render belongs in setup: a value that fills in a detail later is read in `onMounted` and `v-if`ed until it arrives. Own the flag where nothing suspends the component, or where the template guards on something an imperative library builds in `onMounted`.
- `StyledSearchDialog` — the canonical Ctrl+K search palette (dialog + solo autofocus search field + `hotkey` prop registered via `useVHotkey`, `activator` slot, results in the default slot). Every dialog-style search UI mounts through it — never re-roll a `v-dialog` + `v-text-field` + hotkey listener (`onKeyStroke`/`useEventListener`) per feature. See `packages/app/content/docs/architecture/search.md`.
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

**A `:key` names the thing being rendered, never a counter something bumps.** `:key="reloadCount"` is a manual refresh in reactive clothing: the key says nothing about what changed, every writer has to remember to bump it, and the remount throws away scroll and focus to re-fetch data the surface could have been handed. When data changes underneath a mounted surface, the writer **pushes** it — a subscription handler, or a hook registry (`services/shared/createHookRegistry.ts`) the holding stores register into.

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
interface Props {
  foo: Foo;
  parentId: string;
}

const { foo, parentId } = defineProps<Props>();
const bar = ref(foo.bar);
</script>
```

**When to apply:** any component that reads from a store/API and initializes a local editable `ref` from that data, where the store can be empty at component creation time.

A local editable copy of a reactive source is always VueUse `useCloned`, never `ref` + `watch` — the `vue` skill's watch decision tree owns that rule and its `sync`/`clone` options.

## A Registry of Heavy Components Loads on Demand

A map that dispatches a component by type or route — one entry per resource type, per file kind, per renderer —
puts **every** entry in the chunk of whoever imports the map, because a static import is unconditional. Where the
entries carry heavyweight vendors (a canvas library, an editor engine, a viewer) that means opening one type
downloads all of them, and a public page ships five renderers to a visitor who asked for one.

So a registry whose entries are heavy holds loaders, not components — `defineAsyncComponent(() => import(...))`
per entry — and consumers are unaffected, since a registry is read for presence (`if (Map[type])`) or for one
entry at a time.

```typescript
export const FooComponentMap: Record<FooType, Component> = {
  [FooType.Bar]: defineAsyncComponent(() => import("@/components/Foo/Bar.vue")),
};
```

**The render site then owns the wait.** An async component renders nothing until its chunk arrives, so the
`<component :is>` goes inside a `<Suspense>` whose fallback is `StyledSkeleton` — every render site of the
registry, not just the one whose blank region someone noticed. SSR is unaffected (the server renderer resolves
the loader before it emits html, so a server-rendered page keeps its markup and its crawlability); the boundary
is for client-side navigation, where the chunk is fetched with the visitor watching.

A registry of small components stays static: the split buys nothing and costs a request per entry.

**A component that `await`s in setup is async in the same way**, so it owes the same boundary — and only where
it is mounted _after_ its page resolved, behind a `v-if` a click flips. Without one the wait lands on the page's
own `<Suspense>`, which goes pending and holds every unrelated update on the page until the read returns; with a
recursive component, every expansion anywhere in the tree does it again. One awaited during the page's own setup
is already inside that boundary and needs nothing.

## Boolean Props — `is` Prefix + Default-Aware Literal Typing

- **`is` prefix.** Boolean props read as a question: `isDense`, `isInteractive`, `isOpen` — never bare `dense` / `interactive` / `open`, and never `can*` / `should*` (prefer `is`, fall back to `has`; see global naming rules). The same applies to `defineModel` / emit payloads.
- **Type as the non-default literal, not `boolean`**, so passing the default is impossible: defaults-false → `?: true` (caller opts in with the bare attribute), defaults-true → `?: false` with a destructure default `= true`. Derived values, and the one exception for a genuinely two-way boolean, are in `references/props-and-generics.md`.

## Emits — Present-Tense Event Names

Emit names are **present-tense verbs**: `delete`, `update`, `create`, `save`, `submit` — never past tense (`deleted`, `updated`, `copied`). The event names the action the parent should handle, not a completed fact; past-tense names also drift from Vue/DOM convention (`click`, `submit`, `change`).

For state-sync emits, use the `update:x` form where `x` is the state name (`"update:copied": [boolean]`) — the verb stays present tense; the state name may be any shape.

## Component Folder Naming

**A component that gains a folder moves into it as `Index.vue`.** Never leave `Foo.vue` sitting beside a `Foo/` directory — the moment a component is split, `Foo.vue` becomes `Foo/Index.vue` and its parts become its siblings. `Index` contributes nothing to the auto-import name, so `StyledEmojiPicker` still resolves and no consumer changes; keeping both forms only splits one component's files across two places for no benefit. The same holds for TypeScript modules with a folder.

**The folder path is the prefix — never repeat it in the filename.** Nuxt builds the auto-import name from the directory words plus the filename words, so `Feature/Group/ItemCard.vue` → `FeatureGroupItemCard`, and `Index.vue` contributes nothing (`Group/Index.vue` → `FeatureGroup`). Because a filename's leading words that repeat the folder path's trailing run are emitted **only once**, two files can silently generate one name and the un-collapsed tag renders **empty with no error** — when to fold a shared prefix into a folder, the collapse rules and their carve-outs are in `references/component-naming.md`.

## File Length

Line-count target and exceptions — see the `file-organization` skill. Component-specific extractions when a `.vue` runs long: pull toolbar/header buttons into a slot component (e.g. `TopSlot.vue`), row/column action menus into `ActionSlot.vue`, and grouped controls into their own focused component.

## Slots

**Every component that renders a `<slot>` declares `defineSlots`** — typed slot contracts, same as props (`defineSlots<{ default: () => VNode }>()`; `?:` when the consumer may omit it). Forwarding an _optional_ slot into a library component that falls back to a prop needs `#default` + `v-if` on the same template, and extracting a non-trivial slot's content into its own component follows a naming convention — both in `references/slots.md`.
