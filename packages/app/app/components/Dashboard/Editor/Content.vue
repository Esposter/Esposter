<script setup lang="ts">
import { useVisualStore } from "@/store/dashboard/visual";
import { GridItem, GridLayout } from "grid-layout-plus";

const visualStore = useVisualStore();
const { noColumns, visuals } = storeToRefs(visualStore);
const { background, border, surface } = useColors();
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
    border: $border-width-root $border-style-root v-bind(border);
  }
}
</style>
