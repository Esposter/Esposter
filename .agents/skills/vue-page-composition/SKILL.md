---
name: vue-page-composition
description: Apply when decomposing a page, building a list/table of repeated items, wiring row or menu actions, or mounting a dialog for list items. Esposter Vue page and list composition — pages as layout-only orchestrators, constant arrays in services/, maximal component granularity with one action per component and the allowed groupings, v-for over hardcoded repeated items, one affordance per action, permission-gated settings tabs hidden at the tab level, and one singleton dialog driven by a store target rather than a dialog per list item.
---

# Vue Page & List Composition (Esposter)

How pages and lists are assembled from components. How an individual component is _written_ — shell primitives, generics, slots, props, emits, naming — is the `vue-component-patterns` skill's.

## Settled — do not re-propose

- **A rule counting `<UiButton>` per SFC** — the allowed groupings are a roster, and a page may hold route-derived state and `<Head>` values, so neither the button count nor a `ref` under `pages/**` decides anything without reading what the value feeds.

## Deep dives

- `references/singleton-dialogs.md` — when a list item needs a dialog, menu or other overlay opened from a row, or when a dialog carries per-open local state.
- `references/action-items.md` — when row/menu/overflow actions are permission-gated, need the shared `Item` shape, or one command list drives two triggers (a `⋮` menu and a right-click menu).
- `references/list-shells.md` — when two or more lists render the same item layout with different trailing actions, or when a row is itself a link with controls beside it.
- `references/page-decomposition.md` — when a page holds state, a handler or a constant array.
- `references/granularity.md` — when a component holds more than one action, or an extraction is being weighed.
- `references/list-items.md` — when repeated items share one structure.
- `references/one-affordance.md` — when two controls seem to do the same thing.

## Page Decomposition — Pages are Layout + Composition

A page is layout and composition only — `<Head>`, page metadata and sub-components; a `ref`, `computed` or handler belonging to one element moves into that element's component, and a constant array goes to `services/<domain>/` (`references/page-decomposition.md`).

## Maximal Component Granularity — One Action per Component

One component per action: each action button is its own component with its store wiring and inline handler, a row reduces to layout, a menu and its items are one unit, and a `v-for` item with logic of its own is its own component — never a forwarding wrapper — while buttons that are genuinely one logic, rendered from one config array, stay one `v-for` (`references/granularity.md`).

## List Item Rendering: Array + v-for over Hardcoded Items

Three or more items with one shape — two once they will grow or carry non-trivial props — are a PascalCase array in `services/<domain>/` rendered with `v-for`, a reactive one a `computed`, and an enum with no extra data iterated directly (`references/list-items.md`).

## One Affordance Per Action — No Duplicate Behaviour

Every action has exactly one visible control — keep the largest hit target with the least chrome; a second trigger for one command list, a genuinely different behaviour and a banner's own stop control are not duplicates (`references/one-affordance.md`).

## Settings Tab Permissions — Hide at the Tab Level

A permission-gated settings tab is hidden by a tab-definition map (`FooPermissionMap` in `services/<domain>/settings/`) filtered through `hasPermission` in a `computed`; a tab never renders an insufficient-permissions message, and the map hides the tab without withholding anything (`references/action-items.md`, "Settings tabs hide at the tab level").

## Singleton Dialogs — Store-Driven Target, Never Per-Item

**Never mount a dialog (or any heavy overlay subtree) inside a list item.** A `v-for` over N items with an embedded dialog or menu creates N component trees that mount, hydrate and re-render as one — which is how a list page ends up with a seconds-long INP. One instance is mounted at list level and driven by a target ref in a per-service dialog store; the three-part wiring is in `references/singleton-dialogs.md`, and the rationale in `apps/web/content/docs/architecture/singleton-dialogs.md` (keep that page updated when this pattern evolves).
