<script setup lang="ts">
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { computeColumnChartData } from "@/services/resource/sheet/column/computeColumnChartData";

interface Props {
  columnStatistics?: ColumnStatistics;
}

const isOpen = defineModel<boolean>({ default: false });
const { columnStatistics } = defineProps<Props>();
const chartData = computed(() => (columnStatistics ? computeColumnChartData(columnStatistics) : undefined));
</script>

<template>
  <StyledDialog v-model="isOpen" :card-props="{ title: `${columnStatistics?.columnName} — Chart`, width: '48rem' }">
    <StyledApexChart v-if="chartData" :options="chartData.options" :series="chartData.series" :type="chartData.type" />
  </StyledDialog>
</template>
