<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { computeColumnStats } from "@/services/tableEditor/file/column/computeColumnStats";

interface ChartDialogButtonProps {
  column: DataSource["columns"][number];
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<ChartDialogButtonProps>();
const isOpen = ref(false);
const columnStats = computed(() => {
  if (!isOpen.value) return null;
  return computeColumnStats(dataSource).find((stats) => stats.columnName === column.name) ?? null;
});
</script>

<template>
  <template v-if="column.type === ColumnType.Number || column.type === ColumnType.Boolean">
    <v-tooltip text="Column Chart">
      <template #activator="{ props: tooltipProps }">
        <v-btn m-0 icon="mdi-chart-bar" size="small" tile :="tooltipProps" @click.stop="isOpen = true" />
      </template>
    </v-tooltip>
    <TableEditorFileColumnChartDialog v-model="isOpen" :column-stats />
  </template>
</template>
