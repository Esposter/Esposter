<script setup lang="ts">
import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";

import { computeColumnChartData } from "@/services/tableEditor/file/column/computeColumnChartData";
import VueApexCharts from "vue3-apexcharts";

interface ChartDialogProps {
  columnStatistics: ColumnStatistics | null;
}

const isOpen = defineModel<boolean>();
const { columnStatistics } = defineProps<ChartDialogProps>();
const chartData = computed(() => (columnStatistics ? computeColumnChartData(columnStatistics) : null));
</script>

<template>
  <TableEditorDialog v-model="isOpen" :title="`${columnStatistics?.columnName} — Chart`">
    <VueApexCharts v-if="chartData" :options="chartData.options" :series="chartData.series" :type="chartData.type" />
  </TableEditorDialog>
</template>
