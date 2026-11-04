<script setup lang="ts">
import { VisualTypeCategoryDefinitions } from "@/services/dashboard/VisualTypeCategoryDefinitions";

// Closed on a phone, so the grid is the first thing on the screen, and open on a desktop, where its tiles take little room.
// The width is measured after the first render, so the state follows the measured width rather than the narrowest one
// The server renders with, which a plain initial read would keep closed on a desktop
const { isMobile } = useUiDisplay();
const isOpen = ref(false);
onMounted(() => {
  watchImmediate(isMobile, (newIsMobile) => {
    isOpen.value = !newIsMobile;
  });
});
</script>

<template>
  <UiCollapsible v-model="isOpen">
    <template #title>Visuals</template>
    <div px-3 pb-3 flex flex-col gap-3>
      <section v-for="{ items, title } of VisualTypeCategoryDefinitions" :key="title" flex flex-col gap-2>
        <p text-sm text-muted>{{ title }}</p>
        <div flex flex-wrap gap-2>
          <DashboardPaletteTile
            v-for="{ title: tileTitle, value } of items"
            :key="value"
            :title="tileTitle"
            :type="value"
          />
        </div>
      </section>
    </div>
  </UiCollapsible>
</template>
