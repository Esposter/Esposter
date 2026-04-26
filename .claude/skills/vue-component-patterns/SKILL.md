---
name: vue-component-patterns
description: Esposter Vue 3 component architecture patterns — generic components, type correctness, co-location, file length, slot extraction, and same-level abstraction. Apply when designing or refactoring Vue components.
---

# Vue Component Patterns (Esposter)

## Same Level of Abstraction

Every statement in `<script setup>` must operate at the same conceptual level. Mix low-level detail with high-level orchestration and the component becomes hard to read and hard to extend.

**Rule:** If one line calls a composable that encapsulates a concept, all other lines should be at that same call-site level — not implementing sub-steps inline.

```vue
<!-- WRONG: selectedRoleId/selectedRole management is a lower-level concern mixed in -->
<script setup lang="ts">
const roles = computed(() => getRoles(roomId));
const selectedRoleId = ref(roles.value[0]?.id ?? null);
const selectedRole = computed(() => roles.value.find(({ id }) => id === selectedRoleId.value) ?? null);
watch(roles, (newRoles) => {
  if (selectedRoleId.value !== null && !newRoles.some(({ id }) => id === selectedRoleId.value))
    selectedRoleId.value = newRoles[0]?.id ?? null;
});
</script>

<!-- CORRECT: all lines at the same orchestration level -->
<script setup lang="ts">
const roles = computed(() => getRoles(roomId));
const { selectedRole, selectedRoleId } = useSelectedRole(roles);
</script>
```

**Signals that abstraction levels are mixed:**

- A composable call sits next to a manual `ref` + `computed` + `watch` block implementing the same concept
- A `v-if="x !== null"` guard exists so that the template body can avoid null checks (extract to a child component receiving a non-null prop instead)
- Inline `watch` callbacks contain multi-step logic that belongs in a composable

**Fix:** extract the lower-level block into a composable (`use*`) or a child component, then call it at the same level as everything else.

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

## List Item Rendering: Array + v-for over Hardcoded Items

**Never hardcode repeated `<v-list-item>` (or any list item) elements** when the items share the same structure — extract to an array and render with `v-for`.

The array lives in `services/` (co-located with the component's feature folder), not inline in the component. **Constant arrays use PascalCase names.**

```
services/permission/PermissionItems.ts   ← array defined here
components/Permission/List.vue           ← imports and v-for renders
```

```ts
// services/permission/PermissionItems.ts
export const PermissionItems = [
  { value: "read", title: "Read", prependIcon: "mdi-eye" },
  { value: "write", title: "Write", prependIcon: "mdi-pencil" },
  { value: "admin", title: "Admin", prependIcon: "mdi-shield" },
] as const;
```

```vue
<!-- WRONG: hardcoded items with identical structure -->
<v-list>
  <v-list-item value="read" title="Read" prepend-icon="mdi-eye" />
  <v-list-item value="write" title="Write" prepend-icon="mdi-pencil" />
  <v-list-item value="admin" title="Admin" prepend-icon="mdi-shield" />
</v-list>

<!-- CORRECT: import array from services/, v-for in template -->
<script setup lang="ts">
import { PermissionItems } from "@/services/permission/PermissionItems";
</script>
<template>
  <v-list>
    <v-list-item
      v-for="{ value, title, prependIcon } of PermissionItems"
      :key="value"
      :value="value"
      :title="title"
      :prepend-icon="prependIcon"
    />
  </v-list>
</template>
```

**When to apply:**

- 3+ list items with the same props shape — always extract
- 2 items — extract if they'll grow or the props are non-trivial
- Items that differ in non-trivial ways (different slots, conditional logic) — keep separate or use a dispatcher child component

## Permission-Filtered Action Items: Composable + v-for

When list items or icon buttons are guarded by `v-if` permission checks, **move the filtering into a composable** — the template gets a plain `v-for` with no conditions.

Use the existing `Item` type (`@/models/shared/Item`) for the array element shape. The composable reads permissions from stores internally; only pass per-item runtime data (e.g. `userId`, `isMuted`) as arguments to the getter function.

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
<!-- WRONG: v-if on each list item -->
<v-list-item v-if="canDoA && !someState" prepend-icon="mdi-x" title="Action A" @click="doA(id)" />
<v-list-item v-if="canDoB" prepend-icon="mdi-y" title="Action B" @click="doB(id)" />

<!-- CORRECT: filtered array from composable, single v-for -->
<v-list-item
  v-for="{ icon, title, onClick } of getActions(id, someState)"
  :key="title"
  :prepend-icon="icon"
  :title
  @click="onClick"
/>
```

## Icon Buttons with Tooltips: Computed Array + v-for

Repeated `v-tooltip` + `v-btn` (icon button) blocks with the same structure should be extracted to a `computed` array in a composable. Dynamic props (icon, color, tooltip text) that depend on reactive state belong in the `computed`.

```ts
// Composable defines the interface and computed
interface ControlItem {
  color?: string;
  icon: string;
  onClick: () => void;
  tooltip: string;
  variant: "plain" | "tonal";
}

const controlItems = computed<ControlItem[]>(() => [
  {
    tooltip: isActive.value ? "Deactivate" : "Activate",
    icon: isActive.value ? "mdi-off" : "mdi-on",
    color: isActive.value ? "error" : undefined,
    variant: "plain",
    onClick: toggle,
  },
  { tooltip: "Leave", icon: "mdi-exit", color: "error", variant: "tonal", onClick: leave },
]);
```

```vue
<!-- WRONG: three identical v-tooltip+v-btn blocks -->
<v-tooltip :text="isActive ? 'Deactivate' : 'Activate'" location="bottom">
  <template #activator="{ props }">
    <v-btn :="props" :icon="isActive ? 'mdi-off' : 'mdi-on'" :color="isActive ? 'error' : undefined"
      size="x-small" variant="plain" :ripple="false" @click="toggle" />
  </template>
</v-tooltip>
<v-tooltip text="Leave" location="bottom">
  <template #activator="{ props }">
    <v-btn :="props" icon="mdi-exit" color="error" size="x-small" variant="tonal" :ripple="false" @click="leave" />
  </template>
</v-tooltip>

<!-- CORRECT: single v-for -->
<v-tooltip
  v-for="{ tooltip, icon, color, variant, onClick } of controlItems"
  :key="tooltip"
  :text="tooltip"
  location="bottom"
>
  <template #activator="{ props }">
    <v-btn :="props" :icon :color size="x-small" :variant :ripple="false" @click="onClick" />
  </template>
</v-tooltip>
```

**When NOT to extract:** Items that render fundamentally different components (e.g. `StyledDeleteFormDialog` vs `StyledFormDialog` with unique slot content) — the template structure diverges too much for a shared shape.
