<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { GridItem, GridLayout } from "grid-layout-plus";

const visualStore = useVisualStore();
const { visuals } = storeToRefs(visualStore);
</script>

<template>
  <UiEmptyState
    v-if="visuals.length === 0"
    description="Add a visual from the bar above, then click it to bind its data"
    :meaning="UiIconMeaning.Chart"
    title="No visuals yet"
    flex-1
  />
  <div v-else p-3 flex-1>
    <GridLayout v-model:layout="visuals" :col-num="DASHBOARD_NO_COLUMNS" :row-height="40" :use-style-cursor="false">
      <GridItem v-for="{ id, type, x, y, w, h } of visuals" :key="id" :i="id" :x :y :w :h>
        <DashboardVisualPreviewContainer :id size-full :type />
      </GridItem>
    </GridLayout>
  </div>
</template>

<style scoped lang="scss">
/* The grid is the page's background, and each tile a panel on its edge, in the library's tokens */
:deep(.vgl-layout) {
  width: 100%;
  min-height: 100%;
  background-color: var(--ui-background);
}

:deep(.vgl-item) {
  cursor: pointer;

  &:active:not(:focus-within) {
    opacity: var(--v-medium-emphasis-opacity);
  }

  &:not(.vgl-item--placeholder) {
    background-color: var(--ui-panel);
    border-radius: var(--ui-container-radius);
    box-shadow: var(--ui-frame-shadow);
  }
}
</style>
