<script setup lang="ts">
import { useApexOptions } from "@/composables/dashboard/useApexOptions";
import type { Visual } from "@/models/dashboard/Visual";
import { VisualTypeDemoDataMap } from "@/services/dashboard/demo/VisualTypeDemoDataMap";
import VueApexCharts from "vue3-apexcharts";

interface VisualProps {
  type: Visual["type"];
  chart: Visual["chart"];
}

const { type, chart } = defineProps<VisualProps>();
const divRef = ref<HTMLDivElement>();
const height = ref<number>();
// The div height resizes based on the grid layout plus library css
// so we have to use the resize observer to listen for its changes
useResizeObserver(divRef, ([{ target }]) => {
  height.value = (target as HTMLDivElement).clientHeight;
});

const data = computed(() => VisualTypeDemoDataMap[type](chart.type));
const options = useApexOptions(
  () => chart,
  () => type,
  computed(() => ({
    ...data.value.options,
    chart: {
      height: height.value,
      zoom: {
        enabled: false,
      },
    },
  })),
);
</script>

<template>
  <StyledCard size-full>
    <div ref="divRef" h-full>
      <VueApexCharts :="data" :options />
    </div>
  </StyledCard>
</template>
