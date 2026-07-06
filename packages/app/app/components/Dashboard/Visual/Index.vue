<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualTypeDemoDataMap } from "@/services/dashboard/demo/VisualTypeDemoDataMap";
import { takeOne } from "@esposter/shared";
import VueApexCharts from "vue3-apexcharts";

interface VisualProps {
  visual: Visual;
}

const { visual } = defineProps<VisualProps>();
const container = useTemplateRef("container");
const height = ref<number>();
// Grid layout + library CSS drive the height, so observe it for changes.
useResizeObserver(container, (entries) => {
  const entry = takeOne(entries);
  height.value = entry.target.clientHeight;
});

const { error, isLoading, refresh, visualPropsData } = useVisualPropsData(() => visual);
const data = computed(() => visualPropsData.value ?? VisualTypeDemoDataMap[visual.type](visual.chart.type));
const options = useApexOptions(
  () => visual.chart,
  () => visual.type,
  computed(() => ({
    ...data.value.options,
    chart: {
      height: height.value,
    },
  })),
);
</script>

<template>
  <StyledCard size-full>
    <div ref="container" relative h-full>
      <v-alert v-if="error" type="error" text="Failed to load data" />
      <VueApexCharts v-else :="data" :options />
      <StyledTooltipIconButton
        v-if="visual.dataset"
        absolute
        top-1
        right-1
        icon="mdi-refresh"
        text="Refresh data"
        :button-props="{ loading: isLoading, size: 'small', variant: 'text' }"
        @click="refresh()"
      />
    </div>
  </StyledCard>
</template>
