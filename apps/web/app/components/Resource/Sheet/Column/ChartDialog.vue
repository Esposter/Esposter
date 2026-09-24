<script setup lang="ts">
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { computeColumnChartData } from "@/services/resource/sheet/column/computeColumnChartData";

interface Props {
  columnStatistics?: ColumnStatistics;
}

const isOpen = defineModel<boolean>({ default: false });
const { columnStatistics } = defineProps<Props>();
const chartData = computed(() => (columnStatistics ? computeColumnChartData(columnStatistics) : undefined));
</script>

<template>
  <UiDialog
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    :title="`${columnStatistics?.columnName} — Chart`"
    w="[min(48rem,90vw)]"
  >
    <StyledApexChart
      v-if="chartData"
      :options="chartData.options"
      :series="chartData.series"
      :type="chartData.type"
      p-3
    />
  </UiDialog>
</template>
