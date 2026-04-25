<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { computeColumnStatistics } from "@/services/tableEditor/file/column/computeColumnStatistics";

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
    <v-tooltip text="Column Chart">
      <template #activator="{ props: tooltipProps }">
        <v-btn m-0 icon="mdi-chart-bar" size="small" tile :="tooltipProps" @click.stop="isOpen = true" />
      </template>
    </v-tooltip>
    <TableEditorFileColumnChartDialog v-model="isOpen" :column-statistics />
  </template>
</template>
