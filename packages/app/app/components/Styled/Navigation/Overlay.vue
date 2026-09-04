<script setup lang="ts">
import type { NavigationItem } from "@/models/shared/NavigationItem";

import { LEFT_DRAWER_WIDTH } from "#shared/services/app/constants";

interface Props {
  items: NavigationItem[];
}

const { items } = defineProps<Props>();
// Closed at every breakpoint until the caller's hamburger opens it, and closed again by the entry that was
// Picked — navigation is the drawer's whole purpose, so staying open outlives its reason to be there
const isOpen = defineModel<boolean>({ required: true });
</script>

<!-- A drawer over the content rather than a rail beside it: the content is the widest thing on the page and
     these are a handful of links reached a few times a session. It floats over that content with no scrim, so
     the shadow is the only thing separating the two — unlike a v-navigation-drawer, which reserves its own
     column in the layout and needs nothing to sit flat against the page beside it -->
<template>
  <v-slide-x-transition>
    <v-sheet v-if="isOpen" elevation="4" inset-y-0 left-0 absolute z-2 overflow-y-auto :width="LEFT_DRAWER_WIDTH">
      <StyledNavigationList :items @select="isOpen = false" />
    </v-sheet>
  </v-slide-x-transition>
</template>
