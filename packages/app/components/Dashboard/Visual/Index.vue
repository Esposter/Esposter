<script setup lang="ts">
import type { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { DashboardVisualTypeDemoDataMap } from "@/services/dashboard/demo/DashboardVisualTypeDemoDataMap";
import VueApexCharts from "vue3-apexcharts";

interface VisualProps {
  type: DashboardVisualType;
}

const { type } = defineProps<VisualProps>();
const data = DashboardVisualTypeDemoDataMap[type];
const divRef = ref<HTMLDivElement>();
const height = ref<number>();
// The div height resizes based on the grid layout plus library css
// so we have to use the resize observer to listen for its changes
const resizeObserver = new ResizeObserver(([{ target }]) => {
  height.value = (target as HTMLDivElement).clientHeight;
});

watch(divRef, (newDiv) => {
  if (!newDiv) return;
  resizeObserver.observe(newDiv);
});

onUnmounted(() => {
  resizeObserver.disconnect();
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
