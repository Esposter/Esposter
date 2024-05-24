<script setup lang="ts">
import { useLayoutStore } from "@/store/dashboard/layout";
import { GridItem, GridLayout } from "grid-layout-plus";

const layoutStore = useLayoutStore();
const { layout, noColumns } = storeToRefs(layoutStore);
const { background, border, surface } = useColors();
</script>

<template>
  <v-container flex-1 fluid>
    <GridLayout
      v-model:layout="layout"
      :col-num="noColumns"
      :row-height="30"
      is-draggable
      is-resizable
      vertical-compact
      use-css-transforms
    >
      <GridItem
        v-for="{ type, i, x, y, w, h } in layout"
        :key="i"
        content-center
        text-center
        :x="x"
        :y="y"
        :w="w"
        :h="h"
        :i="i"
      >
        <DashboardVisualPreview :type />
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

:deep(.vgl-item:not(.vgl-item--placeholder)) {
  background-color: v-bind(surface);
  border: 1px $border-style-root v-bind(border);
}
</style>
