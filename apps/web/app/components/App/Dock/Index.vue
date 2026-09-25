<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useLayoutStore } from "@/store/layout";
import { useCommandStore } from "@/store/ui/command";
import { RoutePath, SITE_NAME } from "@esposter/shared";

const layoutStore = useLayoutStore();
const { isFooterFocused } = storeToRefs(layoutStore);
const commandStore = useCommandStore();
const { isCommandPaletteOpen } = storeToRefs(commandStore);
const { openCommandPalette } = commandStore;
</script>

<!-- What is app-wide and nothing that belongs to the page: home, every product, the command palette, the reader's own
     places, what needs attention, the theme and the style, and who is signed in. A rail down the left edge on a wide
     screen; on a narrow one a bar along the bottom, under the thumb, which steps aside while the page's composer has
     the keyboard -->
<template>
  <nav
    aria-label="Dock"
    :class="isFooterFocused ? 'hidden md:flex' : 'flex'"
    w="full md:[--dock-size]"
    h="[--dock-size] md:full"
    p-2
    gap-2
    items-center
    bottom-0
    left-0
    fixed
    z-1006
    ui-frame
    md:flex-col
    class="[--ui-popover-from:translateY(calc(var(--ui-step)*4))] [--ui-tooltip-position-area:top] md:[--ui-popover-from:translateX(calc(var(--ui-step)*-4))] md:[--ui-tooltip-position-area:right]"
  >
    <UiTooltip #default="{ activatorProps }" :label="SITE_NAME">
      <NuxtInvisibleLink :="activatorProps" :to="RoutePath.Index" :aria-label="SITE_NAME" shrink-0>
        <AppLogo width="2.5rem" />
      </NuxtInvisibleLink>
    </UiTooltip>
    <AppDockLauncher />
    <!-- Its tooltip stands down while the palette is open, as a panel trigger's does: shown before the modal, it would
      Stay drawn under the scrim -->
    <UiTooltip #default="{ activatorProps }" :disabled="isCommandPaletteOpen" label="Search and commands (Ctrl+K)">
      <UiButton
        :="activatorProps"
        aria-label="Search and commands (Ctrl+K)"
        aria-haspopup="dialog"
        :variant="UiButtonVariant.Quiet"
        px-0
        size-10
        @click="openCommandPalette()"
      >
        <UiIcon :meaning="UiIconMeaning.Command" />
      </UiButton>
    </UiTooltip>
    <AppDockPlaces hidden of-y-auto md:flex md:flex-col />
    <div flex-1 />
    <AppNotificationBell />
    <AppDockThemeModeMenu />
    <AppDockUiStyleMenu />
    <AppDockAccount />
  </nav>
</template>
