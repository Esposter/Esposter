---
name: vue-component-patterns
description: Apply when writing, typing, naming, or refactoring an individual Vue component. Esposter Vue 3 component authoring — the shared Styled/App shell primitives (StyledPageHeader one per route, StyledEmptyState, StyledSkeleton, StyledSearchDialog, AppBreadcrumbs) and registering a new product, same level of abstraction in script setup, selection read from the store instead of threaded props, :key-remount and props-down initialisation of local state, the wrapper + pure-child pattern for async data, useCloned for local copies, a registry of heavy components holding defineAsyncComponent loaders with a Suspense boundary at every render site, is-prefixed boolean props typed as the non-default literal, present-tense emit names, the folder-path-is-the-prefix naming rule, defineSlots on every component that renders a slot, plus deep dives on the shared shell and what a new product wires up, async components and heavy registries, generic SFCs and per-variant prop/model typing, component folder naming with Nuxt auto-import name collapse, and slot declaration, conditional forwarding and extraction.
---

# Vue Component Patterns (Esposter)

How an individual component is written, typed and named. Assembling a page or list _from_ components — decomposition, `v-for` items, action items, singleton dialogs — is the `vue-page-composition` skill's.

## Deep dives

- `references/props-and-generics.md` — when a prop or model type depends on an enum/discriminant key, when one component is absorbing several data variants, or when a boolean prop has a default.
- `references/component-naming.md` — when creating, renaming or moving a component file, when a directory of components gets crowded, or when a tag renders empty with no error.
- `references/shared-shell.md` — when a page needs chrome, or a new product or editor is added.
- `references/async-components.md` — when a map dispatches a heavy component, or a component awaits in setup behind a `v-if`.
- `references/slots.md` — when a component declares a slot, forwards an optional slot into a library component, or a named slot's content has grown non-trivial.

## Shared Shell / Design-System Primitives — `references/shared-shell.md`

Cross-product chrome is a small set of shared components in `components/Styled/` (design-system) and `components/App/` (app-chrome) — **reuse them, never re-roll a bare `v-toolbar` per editor.** Their design and rationale live in `apps/web/content/docs/resource/shell-cohesion.md`; keep that spec live in the same change when you add or alter a shell primitive.

`StyledPageHeader`, `StyledEmptyState`, `StyledSkeleton`, `StyledSearchDialog` and `AppBreadcrumbs` are the set; what each is for, and what a new product or editor wires up (its page's header, a launcher entry, a search palette), is that page.

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

## A Registry of Heavy Components Loads on Demand — `references/async-components.md`

A map dispatching a component by type puts every entry in its importer's chunk, so a registry whose entries carry heavy vendors holds `defineAsyncComponent(() => import(...))` loaders, and every render site of it puts the `<component :is>` inside a `<Suspense>` whose fallback is `StyledSkeleton`. A registry of small components stays static, and a component that `await`s in setup behind a `v-if` owes the same boundary.

## Boolean Props — `is` Prefix + Default-Aware Literal Typing

- **`is` prefix.** Boolean props read as a question: `isDense`, `isInteractive`, `isOpen` — never bare `dense` / `interactive` / `open`, and never `can*` / `should*` (prefer `is`, fall back to `has`; see global naming rules). The same applies to `defineModel` / emit payloads.
- **Type as the non-default literal, not `boolean`**, so passing the default is impossible: defaults-false → `?: true` (caller opts in with the bare attribute), defaults-true → `?: false` with a destructure default `= true`. Derived values, and the one exception for a genuinely two-way boolean, are in `references/props-and-generics.md`.

## Emits — Present-Tense Event Names

Emit names are **present-tense verbs**: `delete`, `update`, `create`, `save`, `submit` — never past tense (`deleted`, `updated`, `copied`). The event names the action the parent should handle, not a completed fact; past-tense names also drift from Vue/DOM convention (`click`, `submit`, `change`).

For state-sync emits, use the `update:x` form where `x` is the state name (`"update:copied": [boolean]`) — the verb stays present tense; the state name may be any shape.

## Component Folder Naming — `references/component-naming.md`

A component that gains a folder moves into it as `Index.vue`, never beside the folder; the folder path is the prefix and is never repeated in the filename, since Nuxt builds the auto-import name from both.

## File Length

Line-count target and exceptions — see the `file-organization` skill. Component-specific extractions when a `.vue` runs long: pull toolbar/header buttons into a slot component (e.g. `TopSlot.vue`), row/column action menus into `ActionSlot.vue`, and grouped controls into their own focused component.

## Slots

**Every component that renders a `<slot>` declares `defineSlots`** — typed slot contracts, same as props (`defineSlots<{ default: () => VNode }>()`; `?:` when the consumer may omit it). Forwarding an _optional_ slot into a library component that falls back to a prop needs `#default` + `v-if` on the same template, and extracting a non-trivial slot's content into its own component follows a naming convention — both in `references/slots.md`.
