<script setup lang="ts">
import { useLayoutStore } from "#src/store/layout";
import { RoutePath, SITE_NAME } from "@esposter/shared";

const layoutStore = useLayoutStore();
const { isDockSteppedAside } = storeToRefs(layoutStore);
</script>

<!-- What is app-wide and nothing that belongs to the page: home, every product, the command palette, the reader's own
     places, what needs attention, the theme and the style, and who is signed in. A rail down the left edge on a wide
     screen; on a narrow one a bar along the bottom, under the thumb, which steps aside while a touch screen's
     keyboard is up for the page's composer. The places are shown by a class, never the `hidden` attribute, whose reset
     rule is important and outranks every breakpoint's display -->
<template>
  <nav
    aria-label="Dock"
    :class="isDockSteppedAside ? 'hidden md:flex' : 'flex'"
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
    <AppDockCommandPaletteButton />
    <AppDockPlaces class="hidden md:flex" of-y-auto md:flex-col />
    <div flex-1 />
    <AppNotificationBell />
    <AppDockThemeModeMenu />
    <AppDockUiStyleMenu />
    <AppDockAccount />
  </nav>
</template>
