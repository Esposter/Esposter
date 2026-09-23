<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";
import { RoutePath, SITE_NAME } from "@esposter/shared";

const layoutStore = useLayoutStore();
const { isFooterFocused } = storeToRefs(layoutStore);
</script>

<!-- What is app-wide and nothing that belongs to the page: home, every product, the reader's own places, what needs
     attention and who is signed in. A rail down the left edge on a wide screen; on a narrow one a bar along the
     bottom, under the thumb, which steps aside while the page's composer has the keyboard -->
<template>
  <nav
    aria-label="Dock"
    :class="isFooterFocused ? 'hidden md:flex' : 'flex'"
    w="full md:[--ui-dock-size]"
    h="[--ui-dock-size] md:full"
    p-2
    gap-2
    items-center
    bottom-0
    left-0
    fixed
    z-1006
    ui-frame
    md:flex-col
  >
    <NuxtInvisibleLink :to="RoutePath.Index" :aria-label="SITE_NAME" :title="SITE_NAME" shrink-0>
      <AppLogo width="2.5rem" />
    </NuxtInvisibleLink>
    <AppDockLauncher />
    <AppDockPlaces hidden of-y-auto md:flex md:flex-col />
    <div flex-1 />
    <AppNotificationBell />
    <AppDockAccount />
  </nav>
</template>
