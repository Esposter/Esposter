<script setup lang="ts">
import type { VisualType } from "@/models/dashboard/VisualType";
import { VisualTypeDemoDataMap } from "@/services/dashboard/demo/VisualTypeDemoDataMap";
import VueApexCharts from "vue3-apexcharts";

interface VisualProps {
  type: VisualType;
}

const { type } = defineProps<VisualProps>();
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
        :options="{
          ...data.options,
          chart: {
            height,
            zoom: {
              enabled: false,
            },
          },
        }"
      />
    </div>
  </StyledCard>
</template>
