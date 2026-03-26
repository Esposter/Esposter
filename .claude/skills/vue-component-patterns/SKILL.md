---
name: vue-component-patterns
description: Esposter Vue 3 component architecture patterns — generic components, type correctness, co-location, file length, and slot extraction. Apply when designing or refactoring Vue components.
---

# Vue Component Patterns (Esposter)

## Generic SFC Components

When a component's model value type (or other prop type) depends on an enum/discriminant key, make the component generic:

```vue
<script setup lang="ts" generic="TKey extends SomeEnum">
// SomeEnum is a string enum (e.g. SomeEnum.A = "A"), so interface keys are string literals:
interface ModelValueMap {
  A: boolean | null;
  B: string | null;
}

const modelValue = defineModel<ModelValueMap[TKey]>({ required: true });
</script>
```

- Use `interface` (not `type`) for the value map — string enum values map directly to string literal interface keys
- Define the interface locally in the component (not exported unless reused elsewhere)
- The map type drives inference at call sites where the key type is statically known
- For `as const satisfies` maps, use `Record<Exclude<TEnum, ExcludedVariant>, ValueType>` to explicitly exclude variants that use a different component path (e.g. Boolean → checkbox, not text field)
- If TypeScript cannot narrow the generic type parameter `TKey` in template v-if/v-else branches (correlated generics limitation), fall back to the union type of all possible values (e.g. `ColumnValue`) for `defineModel` — the prop type still provides inference at call sites

## Component Type Correctness

**Match each component's props and model types exactly to the data it handles** — don't mix concerns by using union types and compensating with `v-if` + null-coalescing inside a single component.

- If logic differs per variant (e.g. date formatting for `DateColumn` vs plain text for `Column<String>`), split into separate focused components (`FieldInputDate.vue`, `FieldInputText.vue`)
- Each component should access its props directly without defensive coalescing (e.g. `column.format` not `column.type === ColumnType.Date ? column.format : ""`)
- A **dispatcher** component (e.g. `FieldInput.vue`) is acceptable at the routing level to delegate to the right sub-component — type casts in the dispatcher are necessary at that boundary and acceptable

## Component Co-location (Folder = Auto-import Prefix)

**Group components with the same prefix into a folder** — Nuxt auto-imports components with the folder path as prefix, so co-located components share the prefix automatically without repeating it in filenames.

- `components/TableEditor/File/Row/FieldInput.vue` → auto-import: `TableEditorFileRowFieldInput`
- `components/TableEditor/File/Row/FieldInputDate.vue` → auto-import: `TableEditorFileRowFieldInputDate`
- The folder `Row/` provides the `TableEditorFileRow` prefix — no need to repeat in the filename

## File Length

- **Target 50–100 lines per `.vue` file** — a file consistently over 100 lines is a yellow flag that a slot, sub-component, or composable extraction is overdue.
- Extract toolbar/header buttons into a dedicated slot component (e.g. `TopSlot.vue`), row/column action menus into an `ActionSlot.vue`, and logically grouped controls into their own focused component.
- Complex or rare layout components (e.g. a rich data table with drag-and-drop, pagination, and find/replace) may exceed 100 lines — treat it as a prompt to reconsider, not an absolute rule.

## Slot Extraction (Complex Components)

When a component has many named slots where each slot's content is non-trivial, extract each slot's content into its own dedicated component. Name the component after the slot it fills (e.g. `#tfoot` → `FooterSlot.vue`, `#top` → `TopSlot.vue`, `#[item.actions]` → `ActionSlot.vue`).

The extracted component:

- Receives the minimum props needed to derive its content (e.g. `dataSource`)
- Pulls shared state from the same stores the parent uses (e.g. `useFilterStore`)
- Lives in the same folder as the parent so the auto-import prefix is shared

```vue
<!-- Before: inline slot content in Table.vue -->
<template #tfoot>
  <tr>
    <td v-for="column of displayColumns" :key="column.id">{{ summaries.get(column.name) }}</td>
  </tr>
</template>

<!-- After: extracted to FooterSlot.vue, used in Table.vue -->
<template #tfoot>
  <TableEditorFileRowFooterSlot :data-source="dataSource" />
</template>
```

This keeps the parent component lean and makes each slot independently readable and testable.
