<script setup lang="ts">
import type { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { DashboardVisualTypeDemoDataMap } from "@/services/dashboard/demo/DashboardVisualTypeDemoDataMap";
import ApexCharts from "apexcharts";

interface VisualProps {
  id: string;
  type: DashboardVisualType;
}

const { id, type } = defineProps<VisualProps>();
const data = DashboardVisualTypeDemoDataMap[type];
const divRef = ref<HTMLDivElement>();
const divHeight = ref(0);
// Unfortunately, the div height resizes based on the grid layout plus library css
// and apexcharts only renders the height of the chart on mount, so we have to wait
// until we finish observing the div height resize change before we render the chart
const resizeObserver = new ResizeObserver(([{ target }]) => {
  divHeight.value = (target as HTMLDivElement).clientHeight;
});
let chart: ApexCharts;

watch(divRef, (newDiv) => {
  if (!newDiv) return;
  resizeObserver.observe(newDiv);
});

watch(divHeight, async (newDivHeight) => {
  if (newDivHeight <= 0) return;

  const chartDiv = document.querySelector<HTMLDivElement>(`[id="${id}"]`);
  if (!chartDiv) return;
  chart = new ApexCharts(chartDiv, {
    series: data.series,
    chart: {
      height: newDivHeight,
      type: data.type,
      zoom: { enabled: false },
    },
    ...data.options,
  });
  await chart.render();
  resizeObserver.disconnect();
});

onUnmounted(() => {
  chart.destroy();
});
</script>

<template>
  <StyledCard size-full>
    <div :id ref="divRef" h-full />
  </StyledCard>
</template>
