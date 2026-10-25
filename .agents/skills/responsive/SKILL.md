---
name: responsive
description: Apply when adding or editing any toolbar, action row, button group or surface that must work on mobile, or when tempted to write a device-specific component or folder. Esposter responsive UI — one component for every device, never a device-specific variant.
---

# Responsive / Mobile UI

Narrow viewports are a first-class target, not an afterthought. A row of buttons that fits on a desktop toolbar does not fit on a phone — it either overflows horizontally or wraps into a tall stack of full-width buttons that pushes the actual content off-screen.

## Settled — do not re-propose

- **A device-specific component, folder or name** (`mobile/`, a `Mobile` prefix, a phone-only bar of buttons) — every fix to a surface lands in two copies that drift; write one component and climb the ladder (`One component for every device`, this file).
- **A sheet on a phone in place of a popover** — the popover stays anchored at every width and sizes itself with `min()` against the viewport (`One component for every device`, this file).

## One component for every device

Each surface is written once for every width and climbs the promotion ladder — reflow, a breakpoint prefix, the overflow menu, a container the library swaps, a component per input device — only as far as the rung below fails; there is no `mobile/` folder, no `Mobile` prefix and no phone-only bar of buttons (`openspec/specs/architecture/responsive/design.md`, "One component for every device"). A popover stays anchored at every width, sized with `min()` against the viewport, never a sheet on a phone. What the reader holds — a touch screen's keyboard, a joystick — is `isTouchScreen` or device detection, never a breakpoint.

A region shown from a breakpoint takes the `hidden` **class** (`class="hidden md:flex"`), since the reset hides the attribute form with a rule no breakpoint's display can outrank. `apps/web/app/templates.test.ts` ("breakpoints") refuses the attribute form.

## Occasional commands wait in the overflow menu

A surface shows its toggles, its one lead action and its close mark, and keeps every occasional command in a `UiOverflowMenu` **on every width** — nothing swaps at a breakpoint, so there is no second presentation of the same commands to drift from the first. The menu takes an `Item[]`, and every item carries a mark (`meaning`, or a whole `icon` class) beside its `title`: a menu is a list of labelled rows, never a grid of naked icons. The resource list's toolbar (`apps/web/app/components/Resource/List/Toolbar.vue`):

```vue
<script setup lang="ts">
// The two views of the list are toggles that say whether they are on, so they stay out on every width; what is done
// Now and then waits in the overflow menu
const items = computed<Item[]>(() => [
  { meaning: UiIconMeaning.Download, onClick: () => emit("export"), title: "Export CSV" },
  { meaning: UiIconMeaning.Refresh, onClick: () => emit("refresh"), title: "Refresh" },
  {
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: async () => {
      await navigateTo(RoutePath.ResourceExplorerRecycleBin);
    },
    title: "Recycle bin",
  },
]);
</script>

<template>
  <UiIconButton
    :aria-pressed="isSummaryView"
    label="Summary view"
    :meaning="UiIconMeaning.Summary"
    :variant="UiButtonVariant.Quiet"
    @click="isSummaryView = !isSummaryView"
  />
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
- **A control that is already its own dropdown** (the column chooser in the toolbar example under "Occasional commands wait in the overflow menu" on this page). It is already one tap to a list; nesting a menu inside a menu is worse than leaving it out. Leave it beside the `…`.
- **The primary action of the screen**, when the screen has exactly one.
- **A toggle**, which says whether it is on — a state a menu row hides until it is opened.

### Dialogs live outside the menu

A dialog a menu item opens is mounted in the toolbar, never inside the menu, which destroys it on close (`references/dialogs-from-menus.md`).

## `flex-wrap` is the rare exception

Wrapping a button row to a second line is allowed **only** when the surface genuinely has vertical room to spare and the row is short (roughly ≤ 3 controls) — e.g. a transient selection toolbar. It is not the default, and it is never the answer for a full command bar. When in doubt, move the occasional commands into the `…`.

**A bar that pushes its groups apart never wraps.** A group pushed to the row's end strands alone on a second line once the row runs short. The leading content yields instead (`truncate`, `min-w-0`) and the occasional actions wait in the overflow menu. `apps/web/app/templates.test.ts` ("bars") refuses the wrapping combination.

## Reference pages

- `references/dialogs-from-menus.md` — when a menu item opens a dialog.
