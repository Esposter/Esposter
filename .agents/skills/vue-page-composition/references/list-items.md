# List Items

Read when repeated items share one structure and are about to be written out by hand.

**Never hardcode repeated list items** when they share the same structure — extract to an array and render with `v-for`. The array lives in `services/<domain>/` (co-located with the component's feature folder), not inline, and **constant arrays use PascalCase names**.

```ts
// services/foo/FooItems.ts — array defined here, imported by components/Foo/List.vue
export const FooItems = [
  { value: "read", title: "Read", prependIcon: "i-mdi:eye" },
  { value: "write", title: "Write", prependIcon: "i-mdi:pencil" },
] as const;
```

When the items **are** an enum with no extra per-item data, iterate the enum directly instead of mirroring it into an array — but hoist the `Object.entries` call to a script-setup `const` (see the `vue` skill's render-position rule).

**Sub-case — icon buttons with tooltips.** Repeated `UiTooltip` + `UiIconButton` blocks are the same pattern with a reactive array: the items live in a `computed` (in a composable) rather than a module constant, because icon/color/tooltip text depend on state. The template is still one `v-for` over the computed, destructuring the item into the button.

**When to apply:**

- 3+ list items with the same props shape — always extract
- 2 items — extract if they'll grow or props are non-trivial
- Items differing in non-trivial ways (different slots, conditional logic) — keep separate or use a dispatcher child
- Items rendering fundamentally different components (a delete dialog vs a generic form dialog with unique slot content) — never extract; the template structure diverges too much for a shared shape
