<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useLayoutStore } from "@/store/layout";

// Only where the sidebar is not docked open: the way to open it, and search, which would otherwise be inside it
const layoutStore = useLayoutStore();
const { isDesktop } = storeToRefs(layoutStore);
</script>

<template>
  <!-- Opaque, so page content cannot show through while the bar is stuck -->
  <div v-if="!isDesktop" px-2 py-1 bg-background flex gap-2 items-center top-0 sticky z-1>
    <AppDrawerButton label="Show navigation" :meaning="UiIconMeaning.Menu" />
    <AppSearchButton label="Search docs" flex-1 />
  </div>
</template>
