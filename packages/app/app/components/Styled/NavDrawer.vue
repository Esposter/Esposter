<script setup lang="ts">
import type { NavItem } from "@/models/shared/NavItem";

import { LEFT_DRAWER_WIDTH } from "#shared/services/app/constants";

interface StyledNavDrawerProps {
  items: NavItem[];
}

const { items } = defineProps<StyledNavDrawerProps>();
// Closed at every breakpoint until the caller's hamburger opens it, and closed again by the entry that was
// Picked — navigation is the drawer's whole purpose, so staying open outlives its reason to be there
const isOpen = defineModel<boolean>({ required: true });
</script>

<!-- A drawer over the content rather than a rail beside it: the content is the widest thing on the page and
     these are a handful of links reached a few times a session. The shadow is what separates it from the page —
     there is no scrim, so the page behind stays readable and usable and opening the menu never blocks the work
     it navigates between. It is spelled out because this is a sheet rather than a v-navigation-drawer, and so
     misses the global drawer elevation it has to match -->
<template>
  <v-slide-x-transition>
    <v-sheet v-if="isOpen" elevation="4" inset-y-0 left-0 absolute z-2 overflow-y-auto :width="LEFT_DRAWER_WIDTH">
      <StyledNavList :items @select="isOpen = false" />
    </v-sheet>
  </v-slide-x-transition>
</template>
