<script setup lang="ts">
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { computeColumnChartData } from "@/services/resource/sheet/column/computeColumnChartData";

interface Props {
  columnStatistics?: ColumnStatistics;
}

const isOpen = defineModel<boolean>();
const { columnStatistics } = defineProps<Props>();
const chartData = computed(() => (columnStatistics ? computeColumnChartData(columnStatistics) : undefined));
</script>

<template>
  <ResourceSheetDialog v-model="isOpen" :title="`${columnStatistics?.columnName} — Chart`">
    <StyledApexChart v-if="chartData" :options="chartData.options" :series="chartData.series" :type="chartData.type" />
  </ResourceSheetDialog>
</template>
