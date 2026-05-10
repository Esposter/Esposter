<script setup lang="ts">
import { useColorsStore } from "@/store/colors";
import { useVisualStore } from "@/store/dashboard/visual";
import { GridItem, GridLayout } from "grid-layout-plus";

const visualStore = useVisualStore();
const { noColumns, visuals } = storeToRefs(visualStore);
const colorsStore = useColorsStore();
const { background, border, surface } = storeToRefs(colorsStore);
</script>

<template>
  <v-container fluid flex-1>
    <GridLayout v-model:layout="visuals" :col-num="noColumns" :row-height="40" :use-style-cursor="false">
      <GridItem v-for="{ id, type, x, y, w, h } of visuals" :key="id" :i="id" :x :y :w :h>
        <DashboardVisualPreviewContainer :id size-full :type />
      </GridItem>
    </GridLayout>
  </v-container>
</template>

<style scoped>
:deep(.vgl-layout) {
  width: 100%;
  min-height: 100%;
  background-color: v-bind(background);
  border-radius: var(--border-radius);
}

:deep(.vgl-item) {
  cursor: pointer;

  &:active:not(:focus-within) {
    opacity: var(--v-medium-emphasis-opacity);
  }

  &:not(.vgl-item--placeholder) {
    background-color: v-bind(surface);
    border: var(--border-width) var(--border-style) v-bind(border);
  }
}
</style>
