<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { toRawDeep } from "@esposter/shared";
import { GridItem, GridLayout } from "grid-layout-plus";

interface Props {
  visuals: Visual[];
}

const { visuals } = defineProps<Props>();
// The main dashboard shouldn't actually modify any persisted data
const layout = ref(structuredClone(toRawDeep(visuals)));
</script>

<template>
  <v-container fluid>
    <GridLayout
      v-model:layout="layout"
      :col-num="DASHBOARD_NO_COLUMNS"
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
