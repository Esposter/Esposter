<script setup lang="ts">
import { useVisualStore } from "@/store/dashboard/visual";
import { toRawDeep } from "@esposter/shared";
import { GridItem, GridLayout } from "grid-layout-plus";

const visualStore = useVisualStore();
const { noColumns, visuals } = storeToRefs(visualStore);
// The main dashboard shouldn't actually modify any persisted data
const layout = ref(structuredClone(toRawDeep(visuals.value)));
</script>

<template>
  <v-container fluid>
    <GridLayout
      v-model:layout="layout"
      :col-num="noColumns"
      :row-height="50"
      :use-style-cursor="false"
      :is-draggable="false"
      :is-resizable="false"
      responsive
    >
      <GridItem v-for="{ id, type, chart, x, y, w, h } of visuals" :key="id" :i="id" :x :y :w :h>
        <DashboardVisual :type :chart />
      </GridItem>
    </GridLayout>
  </v-container>
</template>

<style scoped lang="scss">
:deep(.vgl-layout) {
  border-radius: $border-radius-root;
}
</style>
