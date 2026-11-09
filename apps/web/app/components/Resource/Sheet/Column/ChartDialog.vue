<script setup lang="ts">
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiDialogSize } from "@/models/ui/UiDialogSize";
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
    :size="UiDialogSize.Large"
  >
    <StyledApexChart v-if="chartData" :options="chartData.options" :series="chartData.series" :type="chartData.type" />
  </UiDialog>
</template>
