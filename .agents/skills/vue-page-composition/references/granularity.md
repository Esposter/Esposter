# Component Granularity

Read when a component holds more than one action, a `v-for` item carries its own logic, or an extraction is being weighed against over-extraction.

Default to the **smallest coherent unit**. Each component should be stupid simple — ideally one component maps to one action / function / concern. This applies to **any** component, not just buttons: whenever a part of a component has its own distinct responsibility, extract it.

An action button is **not** a leaf — it owns logic. Extract each button (with its `UiTooltip`, its click handler, and the store access it needs) into its own component (`<FooDeleteButton :foo />`), so the list item / page keeps no action logic. The button component holds its own store wiring, and its single-use handler stays **inline in the template** (the `vue` skill's inline-handler rule) — don't extract it to a named script function.

- **List items / rows reduce to pure layout** — avatar, title, subtitle, time, and a row of extracted button/menu components.
- **A keyboard shortcut is a registered command, never the button's own key listener** — `useCommands` binds it for the surface and lists it in the shortcuts dialog (ui-library skill); the button and the command call the same function, as the sheet's undo does through `useSheetHistory`.
- **A menu and its items is one component** — the menu plus its `UiMenuItem` list are one coherent unit.
- **Multi-step logic reused by 2+ buttons** goes into a `use*` composable. A composable is reuse, not single-use extraction — it doesn't violate the inline-handler rule.

## Allowed grouping (do NOT split these)

Keep together only when items are genuinely the same logic: buttons/items rendered via `v-for` over a config array (PascalCase, in `services/<domain>/`), or a coherent group driven by one config (a `UiTabs` from an `items` array, an icon-button toolbar from a `computed` array).

**`v-for` does not exempt the item body.** Iterating is shared structure; per-item _logic_ is not. If each iterated item carries its own handler, store wiring, or multi-step logic, the item body becomes **its own component** rendered inside the `v-for` — the parent's loop stays pure layout. Only inline the item body when it is a plain prop spread with no own logic.

## Do NOT over-extract

Granularity must **simplify the problem** or enable **reuse** — what earns a move across a file boundary (a second caller, a loop, a cached evaluation, a type the inline form cannot carry) is the `over-engineering` skill's, and a relocation of any kind answers to it. The Vue-specific shape: a wrapper that only forwards props/attrs and needs `inheritAttrs: false` plumbing to make a click reach the inner element is inlined, and a component whose template is one element and whose entire script is a `defineEmits` that element re-emits is a rename of `<UiButton>` — inline it at its one call site and delete the file.
