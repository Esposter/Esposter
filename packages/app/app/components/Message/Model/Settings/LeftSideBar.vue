<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

defineSlots<{ default: () => VNode }>();
const layoutStore = useLayoutStore();
const { isDesktop } = storeToRefs(layoutStore);
</script>

<template>
  <v-navigation-drawer location="left" :rail="!isDesktop" permanent>
    <slot />
  </v-navigation-drawer>
</template>
