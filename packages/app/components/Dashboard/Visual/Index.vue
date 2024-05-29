<script setup lang="ts">
import type { Visual } from "@/models/dashboard/Visual";
import { resolveConfiguration } from "@/services/dashboard/chart/resolveConfiguration";
import { VisualTypeDemoDataMap } from "@/services/dashboard/demo/VisualTypeDemoDataMap";
import VueApexCharts from "vue3-apexcharts";

interface VisualProps {
  type: Visual["type"];
  configuration: Visual["configuration"];
}

const { type, configuration } = defineProps<VisualProps>();
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
          resolveConfiguration(
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
            configuration,
          )
        "
      />
    </div>
  </StyledCard>
</template>
