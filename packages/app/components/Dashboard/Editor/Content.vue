<script setup lang="ts">
import { useLayoutStore } from "@/store/dashboard/layout";
import { GridItem, GridLayout } from "grid-layout-plus";

const layoutStore = useLayoutStore();
const { visuals, noColumns } = storeToRefs(layoutStore);
const { background, border, surface } = useColors();
</script>

<template>
  <v-container flex-1 fluid>
    <GridLayout v-model:layout="visuals" :col-num="noColumns" :row-height="40" :use-style-cursor="false">
      <GridItem v-for="{ type, i, x, y, w, h } in visuals" :key="i" text-center content-center :x :y :w :h :i>
        <DashboardVisualPreview :type />
        <DashboardVisualPreviewRemoveButton :id="i" :type />
      </GridItem>
    </GridLayout>
  </v-container>
</template>

<style scoped lang="scss">
:deep(.vgl-layout) {
  width: 100%;
  min-height: 100%;
  background-color: v-bind(background);
  border-radius: $border-radius-root;
}

:deep(.vgl-item) {
  cursor: pointer;

  &:active:not(:focus-within) {
    opacity: var(--v-medium-emphasis-opacity);
  }

  &:not(.vgl-item--placeholder) {
    background-color: v-bind(surface);
    border: 1px $border-style-root v-bind(border);
  }
}
</style>
