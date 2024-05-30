<script setup lang="ts">
import type { Chart } from "@/models/dashboard/chart/Chart";
import type { Visual } from "@/models/dashboard/Visual";
import { resolveChartConfiguration } from "@/services/dashboard/chart/resolveChartConfiguration";
import { VisualTypeDemoDataMap } from "@/services/dashboard/demo/VisualTypeDemoDataMap";
import VueApexCharts from "vue3-apexcharts";

interface VisualProps {
  type: Visual["type"];
  chartConfiguration: Chart["configuration"];
}

const { type, chartConfiguration } = defineProps<VisualProps>();
const data = VisualTypeDemoDataMap[type];
const divRef = ref<HTMLDivElement>();
const height = ref<number>();
// The div height resizes based on the grid layout plus library css
// so we have to use the resize observer to listen for its changes
useResizeObserver(divRef, ([{ target }]) => {
  height.value = (target as HTMLDivElement).clientHeight;
});
</script>

<template>
  <StyledCard size-full>
    <div ref="divRef" h-full>
      <VueApexCharts
        :="data"
        :options="
          resolveChartConfiguration(
            {
              ...data.options,
              chart: {
                height,
                zoom: {
                  enabled: false,
                },
              },
            },
            type,
            chartConfiguration,
          )
        "
      />
    </div>
  </StyledCard>
</template>
