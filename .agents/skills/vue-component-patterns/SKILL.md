---
name: vue-component-patterns
description: Apply when writing, typing, naming, or refactoring an individual Vue component. Esposter Vue 3 component authoring — the shared Ui/App shell primitives reused rather than re-rolled, one level of abstraction in script setup, selection read from the store, :key-remount and props-down initialisation, the wrapper + pure-child pattern for async data, a registry of heavy components holding defineAsyncComponent loaders behind Suspense, is-prefixed boolean props typed as the non-default literal, present-tense emit names, the folder path as the auto-import prefix, and defineSlots on every component that renders a slot.
---

# Vue Component Patterns (Esposter)

How an individual component is written, typed and named. Assembling a page or list _from_ components — decomposition, `v-for` items, action items, singleton dialogs — is the `vue-page-composition` skill's.

## Deep dives

- `references/props-and-generics.md` — when a prop or model type depends on an enum/discriminant key, when one component is absorbing several data variants, or when a boolean prop has a default.
- `references/component-naming.md` — when creating, renaming or moving a component file, when a directory of components gets crowded, or when a tag renders empty with no error.
- `references/shared-shell.md` — when a page needs chrome, or a new product or editor is added.
- `references/async-components.md` — when a map dispatches a heavy component, or a component awaits in setup behind a `v-if`.
- `references/slots.md` — when a component declares a slot, forwards an optional slot into a library component, or a named slot's content has grown non-trivial.
- `references/abstraction-levels.md` — when a script setup mixes a composable with a hand-built block for one concept.
- `references/selection-and-keys.md` — when a child reads the selection, initialises state from a prop, or a `:key` would be bumped.
- `references/wrapper-and-child.md` — when a component initialises editable state from data that may not have arrived.

## Shared Shell / Design-System Primitives — `references/shared-shell.md`

Cross-product chrome is a small set of shared components in `components/Ui/` (the UI library) and `components/App/` (app-chrome) — **reuse them, never re-roll a bare toolbar per editor.** Their design and rationale live in `apps/web/content/docs/resource/shell-cohesion.md`; keep that spec live in the same change when you add or alter a shell primitive.

The `resource` layout's page header, `UiEmptyState`, `UiSkeleton` and `AppBreadcrumbs` are the set; what each is for, and what a new product or editor wires up (its page's header, a launcher entry), is that page. A search of its own is a scope of the one command palette (`ui-library` skill).

## Same Level of Abstraction

Every statement in `<script setup>` sits at one conceptual level — a lower-level block moves to the store or composable that owns its concept (`references/abstraction-levels.md`).

## Selection State: Read the Store, Don't Thread Props

A child reads the selection from the store rather than a threaded prop; local state initialised from a prop resets through `:key`, which names the thing rendered and is never a counter (`references/selection-and-keys.md`).

## Async Data: Wrapper + Pure Child Pattern

Data that may arrive after mount splits into an `Index.vue` wrapper owning the lookup and `v-if`, and a pure child taking it as a required prop (`references/wrapper-and-child.md`).

## A Registry of Heavy Components Loads on Demand — `references/async-components.md`

A map dispatching a component by type puts every entry in its importer's chunk, so a registry whose entries carry heavy vendors holds `defineAsyncComponent(() => import(...))` loaders, and every render site of it puts the `<component :is>` inside a `<Suspense>` whose fallback is a `UiSkeleton` sized to the region. A registry of small components stays static, and a component that `await`s in setup behind a `v-if` owes the same boundary.

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
