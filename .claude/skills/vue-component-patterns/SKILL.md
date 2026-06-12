---
name: vue-component-patterns
description: Esposter Vue 3 component architecture patterns — generic components, type correctness, co-location, file length, slot extraction, and same-level abstraction. Apply when designing or refactoring Vue components.
---

# Vue Component Patterns (Esposter)

## Same Level of Abstraction

Every statement in `<script setup>` must operate at the same conceptual level. Mixing low-level detail with high-level orchestration makes the component hard to read and extend.

**Rule:** If one line calls a composable encapsulating a concept, all other lines should be at that same call-site level — not implementing sub-steps inline.

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

**Signals abstraction levels are mixed:**

- A composable call sits next to a manual `ref` + `computed` + `watch` block implementing the same concept
- A `v-if="x !== null"` guard exists only so the template body can skip null checks (extract to a child component receiving a non-null prop instead)
- Inline `watch` callbacks contain multi-step logic that belongs in a composable

**Fix:** extract the lower-level block into a composable (`use*`) or child component, then call it at the same level as everything else.

## Async Data: Wrapper + Pure Child Pattern

When a component needs async/reactive data (e.g. a store that populates after mount), split into:

- **`Index.vue` (wrapper)** — owns data lookup + `v-if` guard; pure orchestration
- **`Form.vue` (pure child)** — receives data as a required prop; initializes local state once synchronously; no store access for the guarded data

This avoids async races where a `ref` initialized once at setup time (before the store is populated) silently overwrites real data with `""`.

```vue
<!-- Index.vue — wrapper owns the lookup and v-if guard -->
<script setup lang="ts">
const { roomId } = defineProps<{ roomId: string }>();
const { data: session } = await authClient.useSession(useFetch);
const userId = computed(() => session.value?.user.id);
const { getUserToRoomMap } = useUserToRoomStore();
const userToRoom = computed(() => (userId.value ? getUserToRoomMap(roomId)?.get(userId.value) : undefined));
</script>
<template>
  <FeatureForm v-if="userToRoom" :room-id :user-to-room="userToRoom" />
</template>

<!-- Form.vue — pure: prop is guaranteed non-undefined, ref init is safe -->
<script setup lang="ts">
const { roomId, userToRoom } = defineProps<{ roomId: string; userToRoom: UserToRoom }>();
const { updateUserToRoom } = useUserToRoomStore();
const nickname = ref(userToRoom.nickname);
</script>
```

**When to apply:** any component that reads from a store/API and initializes a local editable `ref` from that data, where the store can be empty at component creation time.

## Generic SFC Components

When a component's model value (or other prop) type depends on an enum/discriminant key, make the component generic:

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

- Use `interface` (not `type`) for the value map — string enum values map directly to string literal keys
- Define the interface locally (not exported unless reused elsewhere)
- The map type drives inference at call sites where the key type is statically known
- For `as const satisfies` maps, use `Record<Exclude<TEnum, ExcludedVariant>, ValueType>` to exclude variants using a different component path (e.g. Boolean → checkbox, not text field)
- If TypeScript can't narrow `TKey` in template v-if/v-else branches (correlated generics limitation), fall back to the union of all possible values (e.g. `ColumnValue`) for `defineModel` — the prop type still provides call-site inference

## Component Type Correctness

**Match each component's props/model types exactly to the data it handles** — don't mix concerns via union types + `v-if` + null-coalescing inside one component.

- If logic differs per variant (e.g. date formatting for `DateColumn` vs plain text for `Column<String>`), split into focused components (`FieldInputDate.vue`, `FieldInputText.vue`)
- Each component accesses its props directly without defensive coalescing (`column.format`, not `column.type === ColumnType.Date ? column.format : ""`)
- A **dispatcher** component (e.g. `FieldInput.vue`) is acceptable at the routing level to delegate to the right sub-component — type casts in the dispatcher are necessary and acceptable at that boundary

## Component Co-location (Folder = Auto-import Prefix)

**Group components with the same prefix into a folder** — Nuxt auto-imports with the folder path as prefix, so co-located components share it without repeating it in filenames.

- `components/TableEditor/File/Row/FieldInput.vue` → `TableEditorFileRowFieldInput`
- `components/TableEditor/File/Row/FieldInputDate.vue` → `TableEditorFileRowFieldInputDate`
- The folder `Row/` provides the `TableEditorFileRow` prefix — no need to repeat it in the filename

## File Length

- **Target 50–100 lines per `.vue` file** — consistently over 100 lines is a yellow flag that a slot, sub-component, or composable extraction is overdue.
- Extract toolbar/header buttons into a slot component (e.g. `TopSlot.vue`), row/column action menus into `ActionSlot.vue`, and grouped controls into their own focused component.
- Complex/rare layout components (e.g. a rich data table with drag-and-drop, pagination, find/replace) may exceed 100 lines — treat as a prompt to reconsider, not an absolute rule.

## Slot Extraction (Complex Components)

When a component has many named slots with non-trivial content, extract each slot's content into its own component, named after the slot it fills (`#tfoot` → `FooterSlot.vue`, `#top` → `TopSlot.vue`, `#[item.actions]` → `ActionSlot.vue`).

The extracted component:

- Receives the minimum props to derive its content (e.g. `dataSource`)
- Pulls shared state from the same stores the parent uses (e.g. `useFilterStore`)
- Lives in the same folder as the parent to share the auto-import prefix

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

This keeps the parent lean and makes each slot independently readable and testable.

## List Item Rendering: Array + v-for over Hardcoded Items

**Never hardcode repeated `<v-list-item>` (or any list item) elements** when they share the same structure — extract to an array and render with `v-for`.

The array lives in `services/` (co-located with the component's feature folder), not inline. **Constant arrays use PascalCase names.**

```text
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
- 2 items — extract if they'll grow or props are non-trivial
- Items differing in non-trivial ways (different slots, conditional logic) — keep separate or use a dispatcher child

## Permission-Filtered Action Items: Composable + v-for

When list items or icon buttons are guarded by `v-if` permission checks, **move filtering into a composable** — the template gets a plain `v-for` with no conditions.

Use the existing `Item` type (`@/models/shared/Item`) for the array element shape. The composable reads permissions from stores internally; only pass per-item runtime data (e.g. `userId`, `isMuted`) as getter arguments.

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

**When NOT to extract:** Items rendering fundamentally different components (e.g. `StyledDeleteFormDialog` vs `StyledFormDialog` with unique slot content) — the template structure diverges too much for a shared shape.

## Page Decomposition — Pages are Layout + Composition

Pages (`pages/**/*.vue`) should be **presentation-only orchestrators**: layout structure, `<Head>`, `definePageMeta`/`defineRouteRules`, and composed sub-components. All action logic, validation, and reactive state live in the sub-components or composables they own.

**Rule:** If a page contains a `ref`, `computed`, or named function belonging to a single interactive element (a button, a form), extract that element into its own component. The page's `<script setup>` should read like a bill of materials — imports and metadata, nothing else.

```vue
<!-- WRONG: page owns startCall logic and isCreating state -->
<script setup lang="ts">
definePageMeta({ middleware: "auth" });
const isCreating = ref(false);
const startCall = async () => { ... };
const callCodeOrLink = ref("");
const canJoin = computed(() => ...);
</script>

<!-- CORRECT: page delegates entirely to focused sub-components -->
<script setup lang="ts">
import { CallFeatures } from "@/services/message/room/call/CallFeatures";
definePageMeta({ middleware: "auth" });
</script>
<template>
  <MessageContentCallStartButton />
  <MessageContentCallJoinForm />
  <MessageContentCallFeatureCard v-for="feature of CallFeatures" :key="feature.title" :="feature" />
</template>
```

- **Button components** — own their loading state (`isCreating`, `isDeleting`), the async action, and navigation. Template is just `v-tooltip` + `v-btn`.
- **Form components** — own their field refs, validation computeds, and submit handler. Template is the `v-form` block.
- **Constant arrays** (feature lists, nav items) — live in `services/<domain>/` (e.g. `services/message/room/call/CallFeatures.ts`), never inline in the page.
