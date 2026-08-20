---
name: vue-page-composition
description: Esposter Vue page and list composition — pages as layout-only orchestrators (no ref/computed/handler belonging to one interactive element), constant arrays in services/ and why a one-off bound configuration literal is not one, maximal component granularity with one action per component (extracted action buttons, keyboard-shortcut buttons, a v-menu as one unit) and the allowed groupings plus when not to over-extract including why relocating a constant, computed or composable is not by itself a refactor, v-for over an array instead of hardcoded repeated list items and why v-for does not exempt the item body, one affordance per action (no duplicate control for one command, no link-styled non-links) and the status-banner carve-out that is not one, and never mounting a dialog inside a list item, plus deep dives on the singleton-dialog wiring (per-service dialog store target, useSingletonDialog, keyed per-open state), permission-filtered action items built on the shared Item interface, and shared list-item shells with an action slot including controls nested inside a link row. Apply when decomposing a page, building a list/table of repeated items, wiring row or menu actions, or mounting a dialog for list items.
---

# Vue Page & List Composition (Esposter)

How pages and lists are assembled from components. How an individual component is _written_ — shell primitives, generics, slots, props, emits, naming — is the `vue-component-patterns` skill's.

## Deep dives

- `references/singleton-dialogs.md` — when a list item needs a dialog, menu or other overlay opened from a row, or when a dialog carries per-open local state.
- `references/action-items.md` — when row/menu/overflow actions are permission-gated, need the shared `Item` shape, or one command list drives two triggers (a `⋮` menu and a right-click menu).
- `references/list-shells.md` — when two or more lists render the same item layout with different trailing actions, or when a row is itself a link containing controls.

## Page Decomposition — Pages are Layout + Composition

Pages (`pages/**/*.vue`) are **presentation-only orchestrators**: layout structure, `<Head>`, `definePageMeta`/`defineRouteRules`, and composed sub-components. All action logic, validation, and reactive state live in the sub-components or composables they own.

**Rule:** if a page contains a `ref`, `computed`, or named function belonging to a single interactive element (a button, a form), extract that element into its own component. The page's `<script setup>` should read like a bill of materials — imports and metadata, nothing else.

- **Button components** — own their loading state (`isCreating`, `isDeleting`), the async action, and navigation. Template is just `v-tooltip` + `v-btn`.
- **Form components** — own their field refs, validation computeds, and submit handler. Template is the `v-form` block.
- **Constant arrays** (feature lists, nav items) — live in `services/<domain>/`, never inline in the page, and are rendered with `v-for` (`<FooFeatureCard v-for="feature of FooFeatures" :key="feature.title" :="feature" />`).
- **A bound configuration literal is not one of them.** The array rule is about **reuse and iteration** — the array exists so a `v-for` can render it and so other pages can import it. A one-off `:configuration` object passed to a single component is neither, and moving it to `services/` only trades an inline literal for an import plus a file, leaving the reader two places to look at where the configured component is. Length is not the trigger and neither is looking like a constant: extract when the value is shared, iterated, or gains a type that catches an error class it cannot catch inline. Otherwise it stays where it is bound.

## Maximal Component Granularity — One Action per Component

Default to the **smallest coherent unit**. Each component should be stupid simple — ideally one component maps to one action / function / concern. This applies to **any** component, not just buttons: whenever a part of a component has its own distinct responsibility, extract it.

An action button is **not** a leaf — it owns logic. Extract each `v-btn` (with its `v-tooltip`, its click handler, and the store access it needs) into its own component (`<FooDeleteButton :foo />`), so the list item / page keeps no action logic. The button component holds its own store wiring, and its single-use handler stays **inline in the template** (the `vue` skill's inline-handler rule) — don't extract it to a named script function.

- **List items / rows reduce to pure layout** — avatar, title, subtitle, time, and a row of extracted button/menu components.
- **A button with a keyboard shortcut is its own component**, owning both the `v-btn` and the `onKeyStroke` handler — never wire the shortcut in the parent.
- **A `v-menu` and its items is one component** — the menu plus its list items are one coherent unit.
- **Multi-step logic reused by 2+ buttons** goes into a `use*` composable. A composable is reuse, not single-use extraction — it doesn't violate the inline-handler rule.

### Allowed grouping (do NOT split these)

Keep together only when items are genuinely the same logic: buttons/items rendered via `v-for` over a config array (PascalCase, in `services/<domain>/`), or a coherent group driven by one config (a `v-tabs` from a `tabs` array, an icon-button toolbar from a `computed` array).

**`v-for` does not exempt the item body.** Iterating is shared structure; per-item _logic_ is not. If each iterated item carries its own handler, store wiring, or multi-step logic, the item body becomes **its own component** rendered inside the `v-for` — the parent's loop stays pure layout. Only inline the item body when it is a plain prop spread with no own logic.

### Do NOT over-extract

Granularity must **simplify the problem** or enable **reuse**. Skip refactors that do neither — and that test
governs **relocation of any kind**, not only splitting a component: a constant lifted to `services/`, a template
expression lifted to a `computed`, a block lifted to a composable. Moving code across a file boundary changes
nothing on its own; what earns the move is what it enables on the far side — a second caller, a loop, a cached
evaluation, a type the inline form cannot carry. A move justified only by the thing being long, or by looking
like it belongs somewhere else, leaves the reader two files where there was one and buys nothing back.

- A wrapper that only forwards props/attrs and needs `inheritAttrs: false` plumbing just to make a click reach the inner element is an anti-pattern — inline the `v-tooltip` + `v-btn` instead.
- Don't extract a component that is used in exactly one place and removes no logic from its parent (pure passthrough). Extract when the child owns a distinct responsibility (an action, a form, a self-contained piece of layout), not to hit a line count.
- **The mechanical form of that rule**: a component whose template is one element and whose entire script is a `defineEmits` that element re-emits owns no responsibility — it is a rename of `<StyledButton>`. Inline it at its one call site and delete the file. Two of them side by side look like a family and are really one toolbar row that was never written.

## List Item Rendering: Array + v-for over Hardcoded Items

**Never hardcode repeated `<v-list-item>` (or any list item) elements** when they share the same structure — extract to an array and render with `v-for`. The array lives in `services/<domain>/` (co-located with the component's feature folder), not inline, and **constant arrays use PascalCase names**.

```ts
// services/foo/FooItems.ts — array defined here, imported by components/Foo/List.vue
export const FooItems = [
  { value: "read", title: "Read", prependIcon: "mdi-eye" },
  { value: "write", title: "Write", prependIcon: "mdi-pencil" },
] as const;
```

When the items **are** an enum with no extra per-item data, iterate the enum directly instead of mirroring it into an array — but hoist the `Object.entries` call to a script-setup `const` (see the `vue` skill's render-position rule).

**Sub-case — icon buttons with tooltips.** Repeated `v-tooltip` + `v-btn` blocks are the same pattern with a reactive array: the items live in a `computed` (in a composable) rather than a module constant, because icon/color/tooltip text depend on state. The template is still one `v-for` over the computed, destructuring the item into the `v-btn`.

**When to apply:**

- 3+ list items with the same props shape — always extract
- 2 items — extract if they'll grow or props are non-trivial
- Items differing in non-trivial ways (different slots, conditional logic) — keep separate or use a dispatcher child
- Items rendering fundamentally different components (a delete dialog vs a generic form dialog with unique slot content) — never extract; the template structure diverges too much for a shared shape

## One Affordance Per Action — No Duplicate Behaviour

**Every action gets exactly one visible way to trigger it.** Two controls that do the identical thing are not "convenience" — they make the user stop and ask whether the two differ, and they double the surface that has to stay in sync.

When you find duplicates, keep the affordance with the **largest hit target and the least chrome**, and delete the rest — in a table row that is the row click itself, so a name-cell link and an "Open" button pointing at the same route both go, leaving the actions slot holding only what the row click can't do.

- **Don't style non-links like links.** `text-info` + underline is a promise of a distinct navigation target. If the row already navigates, the name is plain text — styling it as a link implies it goes somewhere else.
- **A different trigger for the same command is not a duplicate.** A right-click context menu and a row `⋮` menu are two triggers for one list of commands — that is fine, and they must be driven by **one** shared `Item[]` (`references/action-items.md`). What is banned is a second _visible_ control for a command that already has one.
- **A genuinely different behaviour is not a duplicate.** `Open in new tab` survives next to row-click because it does something row-click cannot.
- **A status banner's own stop control is not a duplicate either.** Where a transient state announces itself in a banner ("X is presenting", "recording"), the banner carries the control that ends it, even though the toolbar already has a toggle for the same command. The two are not competing affordances: the toolbar toggle is where the command always lives, and the banner's is scoped to the state it is reporting, reachable from wherever the user's attention already is. This is the one place the repo keeps two controls for one command deliberately, and it is what Discord does — so it is a carve-out to apply, not a finding to re-raise.
- If a slot exists only to re-render the default value (`{{ item.name }}`), delete the slot and let the default rendering do it.

## Singleton Dialogs — Store-Driven Target, Never Per-Item

**Never mount a dialog (or any heavy overlay subtree) inside a list item.** A `v-for` over N items with an embedded `v-dialog`/menu creates N full component trees that all mount, hydrate, and re-render together — which is how a list page ends up with a seconds-long INP. One instance is mounted at list level and driven by a target ref in a per-service dialog store; the three-part wiring is in `references/singleton-dialogs.md`, and the rationale in `packages/app/content/docs/architecture/singleton-dialogs.md` (keep that page updated when this pattern evolves).
