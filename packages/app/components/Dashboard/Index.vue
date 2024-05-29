<script setup lang="ts">
import { useVisualStore } from "@/store/dashboard/visual";
import { GridItem, GridLayout } from "grid-layout-plus";

const visualStore = useVisualStore();
const { visualList, noColumns } = storeToRefs(visualStore);
</script>

<template>
  <v-container fluid>
    <GridLayout
      v-model:layout="visualList"
      :col-num="noColumns"
      :row-height="50"
      :use-style-cursor="false"
      :is-draggable="false"
      :is-resizable="false"
      responsive
    >
      <GridItem v-for="{ id, type, configuration, x, y, w, h } in visualList" :key="id" :i="id" :x :y :w :h>
        <DashboardVisual :type :configuration />
      </GridItem>
    </GridLayout>
  </v-container>
</template>

<style scoped lang="scss">
:deep(.vgl-layout) {
  border-radius: $border-radius-root;
}
</style>
