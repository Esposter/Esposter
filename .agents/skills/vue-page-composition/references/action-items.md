# Permission-filtered action items

Read when row/menu actions or settings tabs are permission-gated, or when one command list drives two triggers (a `⋮` menu and a right-click menu). That two triggers may share one command list, but a command may not have two visible controls, is in `SKILL.md`.

When list items or icon buttons are guarded by `v-if` permission checks, **move the filtering into a composable** — the template gets a plain `v-for` with no conditions.

Use the existing `Item` type (`@/models/shared/Item`) for the array element shape — never re-declare an inline `{ title, icon, … }` shape, in a component or in a UI metadata map. `Item` carries `title`, `icon`, optional `isDanger`/`active`/`shortTitle`, and an optional `onClick`, so it covers both display-only metadata and actionable menu items. Reach for a narrower interface only when it matches exactly — `SelectItemCategoryDefinition<T>` (value), `ListItemCategoryDefinition<T>` (value + icon).

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
      items.push({ icon: "i-mdi:x", title: "Action A", onClick: () => doA(targetId) });
    if (canDoB.value)
      items.push({ icon: "i-mdi:y", title: "Action B", onClick: () => doB(targetId) });
    return items;
  };

  return { canDoA, canDoB, getActions };
};
```

```vue
<!-- CORRECT: the filtered array from the composable, handed to one menu -->
<UiOverflowMenu :items="getActions(id, someState)" label="Actions" />
```

## Settings tabs hide at the tab level

Permission-gated settings tabs are hidden via a tab-definition map (`FooPermissionMap` in `services/<domain>/settings/`), which maps each tab type to the permission it requires; the nav component filters visible tabs through `hasPermission` in a `computed`. Individual tab components **never** check permissions — they just fetch and render, because the tab simply isn't shown to users lacking it. **Do NOT** render "Insufficient permissions" text; hide the tab entirely — the same rule as one affordance per action ("One Affordance Per Action — No Duplicate Behaviour"), where a control nobody may use is a control nobody is shown.

**The map hides the tab; it withholds nothing.** What makes the components' never-check rule safe is that the reads and writes behind a mapped tab are gated on the same permission server-side — that half is the `trpc` skill's, and a tab added here without it is a hidden tab in front of an open endpoint.
