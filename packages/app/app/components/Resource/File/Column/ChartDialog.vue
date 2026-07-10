<script setup lang="ts">
import type { ColumnStatistics } from "#shared/models/resource/file/column/ColumnStatistics";

import { computeColumnChartData } from "@/services/resource/file/column/computeColumnChartData";
import VueApexCharts from "vue3-apexcharts";

interface ChartDialogProps {
  columnStatistics: ColumnStatistics | null;
}

const isOpen = defineModel<boolean>();
const { columnStatistics } = defineProps<ChartDialogProps>();
const chartData = computed(() => (columnStatistics ? computeColumnChartData(columnStatistics) : null));
</script>

<template>
  <ResourceFileDialog v-model="isOpen" :title="`${columnStatistics?.columnName} — Chart`">
    <VueApexCharts v-if="chartData" :options="chartData.options" :series="chartData.series" :type="chartData.type" />
  </ResourceFileDialog>
</template>
