<script setup lang="ts">
import { DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { GridItem, GridLayout } from "grid-layout-plus";

const visualStore = useVisualStore();
const { visuals } = storeToRefs(visualStore);
</script>

<template>
  <div p-3 flex-1>
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
    box-shadow: 0 0 0 var(--ui-step) var(--ui-panel-edge);
  }
}
</style>
