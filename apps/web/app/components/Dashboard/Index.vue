<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { DASHBOARD_PUBLISHED_ROW_HEIGHT } from "@/services/dashboard/constants";
import { getBreakpointColumnNumber } from "@/services/dashboard/grid/getBreakpointColumnNumber";

interface Props {
  visuals: Visual[];
}

const { visuals } = defineProps<Props>();
const container = useTemplateRef("container");
const { width } = useElementSize(container);
// The published dashboard only shows its visuals, so a narrower screen reflows them and nothing here is saved
// The grid waits for the width, since before it is measured the columns would be the narrowest breakpoint's and
// Every tile would have no width
const columnNumber = computed(() => getBreakpointColumnNumber(width.value));
</script>

<template>
  <div ref="container">
    <DashboardGrid v-if="width" :column-number :row-height="DASHBOARD_PUBLISHED_ROW_HEIGHT" :visuals>
      <template #default="{ visual }">
        <DashboardVisual :visual />
      </template>
    </DashboardGrid>
  </div>
</template>
