<script setup lang="ts">
import { VisualTypeItemCategoryDefinitions } from "@/services/dashboard/VisualTypeItemCategoryDefinitions";

// Closed on a phone, so the grid is the first thing on the screen, and open on a desktop, where its tiles take little room
const { isMobile } = useUiDisplay();
const isOpen = ref(!isMobile.value);
</script>

<template>
  <UiCollapsible v-model="isOpen">
    <template #title>Visuals</template>
    <div px-3 pb-3 flex flex-wrap gap-2>
      <DashboardPaletteTile
        v-for="{ title, value } of VisualTypeItemCategoryDefinitions"
        :key="value"
        :title
        :type="value"
      />
    </div>
  </UiCollapsible>
</template>
