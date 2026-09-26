---
name: responsive
description: Apply when adding or editing any toolbar, action row, button group or surface that must work on mobile, or when tempted to write a device-specific component or folder. Esposter responsive UI — one component for every device and the promotion ladder before a device-specific one, the hidden class over the hidden attribute, occasional commands in one overflow menu on every width, what stays out of it, and when a row may wrap.
---

# Responsive / Mobile UI

Narrow viewports are a first-class target, not an afterthought. A row of buttons that fits on a desktop toolbar does not fit on a phone — it either overflows horizontally or wraps into a tall stack of full-width buttons that pushes the actual content off-screen.

## One component for every device

A surface is written once for every width and climbs the promotion ladder — reflow, a breakpoint prefix, the overflow menu, a container the library swaps, a component per input device — only as far as the rung below fails; there is no `mobile/` folder, no `Mobile` prefix and no phone-only bar of buttons (`apps/web/content/docs/architecture/responsive.md`, "One component for every device"). A popover stays anchored at every width, sized with `min()` against the viewport, never a sheet on a phone. What the reader holds — a touch screen's keyboard, a joystick — is `isTouchScreen` or device detection, never a breakpoint.

A region shown from a breakpoint takes the `hidden` **class** (`class="hidden md:flex"`): a valueless `hidden` attribute is HTML's, the reset hides it with an important rule, and no breakpoint's display outranks it. `apps/web/app/templates.test.ts` ("breakpoints") refuses the combination.

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

A dialog a menu item opens is mounted in the toolbar, never inside the menu, which destroys it on close (`references/dialogs-from-menus.md`).

## `flex-wrap` is the rare exception

Wrapping a button row to a second line is allowed **only** when the surface genuinely has vertical room to spare and the row is short (roughly ≤ 3 controls) — e.g. a transient selection toolbar. It is not the default, and it is never the answer for a full command bar. When in doubt, move the occasional commands into the `…`.

**A bar that pushes its groups apart never wraps.** A spacer (`<div flex-1 />`), `justify-between` or `justify-end` pushing a group to the row's end, plus `flex-wrap`, sends the trailing group alone to the end of a second line the moment the row runs short — one button at the start of the first line and one at the end of the next, the most frequent broken row in the app. The leading content yields instead (`truncate`, `min-w-0`), the actions keep their size, and the occasional ones already wait in the overflow menu above. `apps/web/app/templates.test.ts` ("bars") refuses the combination.

## Reference pages

- `references/dialogs-from-menus.md` — when a menu item opens a dialog.
