<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { toRawDeep } from "@esposter/shared";
import { GridItem, GridLayout } from "grid-layout-plus";

interface DashboardProps {
  noColumns?: number;
  visuals: Visual[];
}

const { noColumns = 12, visuals } = defineProps<DashboardProps>();
// The main dashboard shouldn't actually modify any persisted data
const layout = ref(structuredClone(toRawDeep(visuals)));
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
      <GridItem
        v-for="visual of visuals"
        :key="visual.id"
        :i="visual.id"
        :x="visual.x"
        :y="visual.y"
        :w="visual.w"
        :h="visual.h"
      >
        <DashboardVisual :visual />
      </GridItem>
    </GridLayout>
  </v-container>
</template>

<style scoped>
:deep(.vgl-layout) {
  border-radius: var(--border-radius);
}
</style>
