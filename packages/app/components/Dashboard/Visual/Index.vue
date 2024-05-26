<script setup lang="ts">
import type { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { DashboardVisualTypeDemoDataMap } from "@/services/dashboard/demo/DashboardVisualTypeDemoDataMap";
import VueApexCharts from "vue3-apexcharts";

interface VisualPreviewProps {
  type: DashboardVisualType;
}

const { type } = defineProps<VisualPreviewProps>();
const data = DashboardVisualTypeDemoDataMap[type];
</script>

<template>
  <StyledCard size-full>
    <VueApexCharts
      :="data"
      :options="{
        ...data.options,
        chart: {
          height: '100%',
          zoom: {
            enabled: false,
          },
        },
      }"
    />
  </StyledCard>
</template>
