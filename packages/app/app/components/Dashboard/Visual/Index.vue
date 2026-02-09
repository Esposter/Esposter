<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualTypeDemoDataMap } from "@/services/dashboard/demo/VisualTypeDemoDataMap";
import { takeOne } from "@esposter/shared";
import VueApexCharts from "vue3-apexcharts";

interface VisualProps {
  chart: Visual["chart"];
  type: Visual["type"];
}

const { chart, type } = defineProps<VisualProps>();
const container = useTemplateRef("container");
const height = ref<number>();
// The div height resizes based on the grid layout plus library css
// So we have to use the resize observer to listen for its changes
useResizeObserver(container, (entries) => {
  const entry = takeOne(entries);
  height.value = entry.target.clientHeight;
});

const data = computed(() => VisualTypeDemoDataMap[type](chart.type));
const options = useApexOptions(
  () => chart,
  () => type,
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
    <div ref="container" h-full>
      <VueApexCharts :="data" :options />
    </div>
  </StyledCard>
</template>
