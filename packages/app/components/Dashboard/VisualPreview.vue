<script setup lang="ts">
import type { DashboardVisualType } from "@/models/dashboard/DashboardVisualType";
import { SampleVisualDataMap } from "@/services/dashboard/sample/SampleVisualDataMap";
import { uncapitalize } from "@/util/text/uncapitalize";
import QuickChart from "quickchart-js";

interface VisualPreviewProps {
  type: DashboardVisualType;
}

const { type } = defineProps<VisualPreviewProps>();
const quickChart = new QuickChart();
const src = ref("");

watch(
  () => type,
  (newType) => {
    quickChart.setConfig({ type: uncapitalize(newType), ...SampleVisualDataMap[newType] });
    src.value = quickChart.getUrl();
  },
);
</script>

<template>
  <v-img :src :alt="type" />
</template>
