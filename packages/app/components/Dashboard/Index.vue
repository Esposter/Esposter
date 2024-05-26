<script setup lang="ts">
import { useLayoutStore } from "@/store/dashboard/layout";
import { GridItem, GridLayout } from "grid-layout-plus";

const layoutStore = useLayoutStore();
const { visuals, noColumns } = storeToRefs(layoutStore);
</script>

<template>
  <v-container fluid>
    <GridLayout
      v-model:layout="visuals"
      :col-num="noColumns"
      :row-height="50"
      :use-style-cursor="false"
      :is-draggable="false"
      :is-resizable="false"
    >
      <GridItem v-for="{ type, i, x, y, w, h } in visuals" :key="i" :x :y :w :h :i>
        <DashboardVisual :type />
      </GridItem>
    </GridLayout>
  </v-container>
</template>

<style scoped lang="scss">
:deep(.vgl-layout) {
  border-radius: $border-radius-root;
}
</style>
