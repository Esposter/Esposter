<script setup lang="ts">
import type { Column } from "#shared/models/resource/file/column/Column";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { computeColumnStatistics } from "@/services/resource/file/column/computeColumnStatistics";

interface ChartDialogButtonProps {
  column: Column;
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<ChartDialogButtonProps>();
const isOpen = ref(false);
const columnStatistics = computed(() => {
  if (!isOpen.value) return null;
  return computeColumnStatistics(dataSource).find((statistics) => statistics.columnName === column.name) ?? null;
});
</script>

<template>
  <template v-if="column.type === ColumnType.Number || column.type === ColumnType.Boolean">
    <StyledTooltipIconButton
      :button-props="{ class: 'm-0', size: 'small', tile: true }"
      icon="mdi-chart-bar"
      text="Column Chart"
      @click.stop="isOpen = true"
    />
    <ResourceFileColumnChartDialog v-model="isOpen" :column-statistics />
  </template>
</template>
