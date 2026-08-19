# Permission-filtered action items

Read when row/menu actions are permission-gated, or when one command list drives two triggers (a `⋮` menu and a right-click menu). That two triggers may share one command list, but a command may not have two visible controls, is in `SKILL.md`.

When list items or icon buttons are guarded by `v-if` permission checks, **move the filtering into a composable** — the template gets a plain `v-for` with no conditions.

Use the existing `Item` type (`@/models/shared/Item`) for the array element shape — never re-declare an inline `{ title, icon, … }` shape, in a component or in a UI metadata map. `Item` carries `title`, `icon`, optional `color`/`active`/`shortTitle`, and an optional `onClick`, so it covers both display-only metadata and actionable menu items. Reach for a narrower interface only when it matches exactly — `SelectItemCategoryDefinition<T>` (value), `ListItemCategoryDefinition<T>` (value + icon).

The composable reads permissions from stores internally; only per-item runtime data (e.g. `userId`, `isMuted`) is passed as getter arguments.

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
