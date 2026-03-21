<script setup lang="ts">
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { computeColumnChartData } from "@/services/tableEditor/file/column/computeColumnChartData";
import VueApexCharts from "vue3-apexcharts";

interface ChartDialogProps {
  columnStats: ColumnStats | null;
}

const isOpen = defineModel<boolean>();
const { columnStats } = defineProps<ChartDialogProps>();
const chartData = computed(() => (columnStats ? computeColumnChartData(columnStats) : null));
</script>

<template>
  <TableEditorDialog v-model="isOpen" :title="`${columnStats?.columnName} — Chart`">
    <VueApexCharts
      v-if="chartData"
      :options="chartData.options"
      :series="chartData.series"
      :type="chartData.type"
    />
  </TableEditorDialog>
</template>
