---
name: responsive
description: Apply when adding or editing any toolbar, action row, or button group that must work on mobile. Esposter responsive/mobile UI conventions — occasional commands in one overflow menu of labelled rows on every width, which controls stay out of it, dialogs mounted outside the menu, and when flex-wrap is the allowed exception.
---

# Responsive / Mobile UI

Narrow viewports are a first-class target, not an afterthought. A row of buttons that fits on a desktop toolbar does not fit on a phone — it either overflows horizontally or wraps into a tall stack of full-width buttons that pushes the actual content off-screen.

## Occasional commands wait in the overflow menu

A surface shows its toggles, its one lead action and its close mark, and keeps every occasional command in a `UiOverflowMenu` **on every width** — nothing swaps at a breakpoint, so there is no second presentation of the same commands to drift from the first. The menu takes an `Item[]`, and every item carries a mark (`meaning`, or a whole `icon` class) beside its `title`: a menu is a list of labelled rows, never a grid of naked icons. The resource list's toolbar (`apps/web/app/components/Resource/List/Toolbar.vue`):

```vue
<script setup lang="ts">
// The two views of the list are toggles that say whether they are on, so they stay out on every width; what is done
// Now and then waits in the overflow menu
const items = computed<Item[]>(() => [
  { meaning: UiIconMeaning.Download, onClick: () => emit("export"), title: "Export CSV" },
  { meaning: UiIconMeaning.Refresh, onClick: () => emit("refresh"), title: "Refresh" },
]);
</script>

<template>
  <UiIconButton
    :aria-pressed="isGroupedByType"
    label="Group by type"
    :meaning="UiIconMeaning.Group"
    :variant="UiButtonVariant.Quiet"
    @click="isGroupedByType = !isGroupedByType"
  />
  <ResourceListColumnChooserMenu :source />
  <UiOverflowMenu :items label="List actions" />
  <ResourceCloseButton />
</template>
```

### What stays out of the menu

- **Close / dismiss (`✕`)** — the escape hatch must never be buried inside a menu.
- **A control that is already its own dropdown** (the column chooser above). It is already one tap to a list; nesting a menu inside a menu is worse than leaving it out. Leave it beside the `…`.
- **The primary action of the screen**, when the screen has exactly one.
- **A toggle**, which says whether it is on — a state a menu row hides until it is opened.

### Dialogs live outside the menu

A dialog mounted inside a menu's list is destroyed when the menu closes, so it never opens. Mount the dialog in the **toolbar** component and have the menu item flip its model, as the resource page's header does (`apps/web/app/components/Resource/Blade/Header.vue`):

```vue
<UiOverflowMenu :items label="Resource actions" />
<ResourceRenameDialog v-if="isRenameOpen" v-model="isRenameOpen" :rename="renameResource" :resource />
```

Mounting with `v-if` alongside `v-model` (rather than keeping it mounted) means the dialog's fields re-initialise from the current props on every open — no `watch` to reset them.

## `flex-wrap` is the rare exception

Wrapping a button row to a second line is allowed **only** when the surface genuinely has vertical room to spare and the row is short (roughly ≤ 3 controls) — e.g. a transient selection toolbar. It is not the default, and it is never the answer for a full command bar. When in doubt, move the occasional commands into the `…`.

**A bar that pushes its groups apart never wraps.** A spacer (`<div flex-1 />`), `justify-between` or `justify-end` pushing a group to the row's end, plus `flex-wrap`, sends the trailing group alone to the end of a second line the moment the row runs short — one button at the start of the first line and one at the end of the next, the most frequent broken row in the app. The leading content yields instead (`truncate`, `min-w-0`), the actions keep their size, and the occasional ones already wait in the overflow menu above. `apps/web/app/templates.test.ts` ("bars") refuses the combination.
