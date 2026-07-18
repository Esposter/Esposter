---
name: responsive
description: Esposter responsive/mobile UI conventions — command bars collapse into a single overflow dropdown of icon+text list items on narrow viewports, which controls never collapse, and when flex-wrap is the allowed exception. Apply when adding or editing any toolbar, action row, or button group that must work on mobile.
---

# Responsive / Mobile UI

Narrow viewports are a first-class target, not an afterthought. A row of buttons that fits on a desktop toolbar does not fit on a phone — it either overflows horizontally or wraps into a tall stack of full-width buttons that pushes the actual content off-screen.

## Command bars collapse into an overflow dropdown

**Default rule:** on `smAndDown`, a row of command buttons collapses into a **single `…` overflow menu** whose contents are `v-list-item`s with an icon and a text title. Native mobile UI is a list of labelled rows, not a grid of naked icons — always `:prepend-icon` **and** `:title`, never icon-only menu items.

Use `useVDisplay()` for the breakpoint and `StyledOverflowMenu` for the menu — it takes an `Item[]` and renders the list for you:

```vue
<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

// When narrow, the toolbar commands collapse into the … overflow menu — the close ✕ never collapses
const { smAndDown } = useVDisplay();
const toolbarItems = computed<Item[]>(() => [
  { active: isGrouped.value, icon: "mdi-format-list-group", onClick: () => toggleGroup(), title: "Group by type" },
  { icon: "mdi-refresh", onClick: () => refresh(), title: "Refresh" },
]);
</script>

<template>
  <StyledTooltipIconButton
    v-for="{ active, icon, onClick, title } of smAndDown ? [] : toolbarItems"
    :key="title"
    :icon
    :text="title"
    :button-props="{ active }"
    @click="onClick"
  />
  <StyledOverflowMenu v-if="smAndDown" icon="mdi-dots-horizontal" :items="toolbarItems" />
  <StyledTooltipIconButton icon="mdi-close" text="Close" @click="navigateTo(closeTo)" />
</template>
```

One `Item[]` feeds both branches — the desktop buttons and the mobile menu are the same commands behind two presentations, so they can never drift apart. Never hand-maintain a second list of the same commands for mobile.

### What never collapses

- **Close / dismiss (`✕`)** — the escape hatch must never be buried inside a menu.
- **A control that is already its own dropdown** (e.g. a column chooser `v-menu`). It is already one tap to a list; nesting a menu inside a menu is worse than leaving it out. Leave it beside the `…`.
- **The primary action of the screen**, when the screen has exactly one.

### Dialogs live outside the menu

A `v-dialog` mounted inside a `v-menu`'s list is destroyed when the menu closes, so its dialog never opens. Mount the dialog in the **toolbar** component and have the menu item flip its model:

```vue
<ResourceBladeOverflowMenu v-else :refresh :resource @delete="isDeleteOpen = true" @rename="isRenameOpen = true" />
<ResourceRenameDialog v-if="isRenameOpen" v-model="isRenameOpen" :rename :resource />
```

Mounting with `v-if` alongside `v-model` (rather than keeping it mounted) means the dialog's fields re-initialise from the current props on every open — no `watch` to reset them.

## `flex-wrap` is the rare exception

Wrapping a button row to a second line is allowed **only** when the surface genuinely has vertical room to spare and the row is short (roughly ≤ 3 controls) — e.g. a transient selection toolbar. It is not the default, and it is never the answer for a full command bar. When in doubt, collapse to `…`.

## Related

- Breakpoint composable naming (`useVDisplay`, never `import { useDisplay } from "vuetify"`) — see the `vuetify` skill.
- Overflow-menu item shape (`Item`) and the composable + `v-for` pattern — see the `vue-component-patterns` skill.
