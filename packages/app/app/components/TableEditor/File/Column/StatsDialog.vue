<script setup lang="ts">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { ColumnStatDefinitions } from "@/services/tableEditor/file/column/ColumnStatDefinitions";
import { computeColumnStats } from "@/services/tableEditor/file/column/computeColumnStats";
import { useTableEditorStore } from "@/store/tableEditor";

const isOpen = defineModel<boolean>();
const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
const { editedItem } = storeToRefs(tableEditorStore);
const isChartOpen = ref(false);
const selectedStats = ref<ColumnStats | null>(null);
const columnStats = computed<ColumnStats[]>(() =>
  editedItem.value?.dataSource ? computeColumnStats(editedItem.value.dataSource) : [],
);
const headers = [
  { key: "chart", sortable: false, title: "" },
  { key: "columnName", sortable: false, title: "Column" },
  { key: "columnType", sortable: false, title: "Type" },
  ...ColumnStatDefinitions.map(({ key, sortable, title }) => ({ key, sortable, title })),
];
const openChart = (stats: ColumnStats) => {
  selectedStats.value = stats;
  isChartOpen.value = true;
};
</script>

<template>
  <TableEditorDialog v-model="isOpen" title="Column Statistics">
    <v-data-table density="compact" item-value="columnName" :headers :items="columnStats">
      <template #[`item.chart`]="{ item }">
        <v-tooltip
          v-if="item.columnType === ColumnType.Number || item.columnType === ColumnType.Boolean"
          text="View Chart"
        >
          <template #activator="{ props }">
            <v-btn density="compact" icon="mdi-chart-bar" variant="text" :="props" @click.stop="openChart(item)" />
          </template>
        </v-tooltip>
      </template>
      <template v-for="{ key, format } of ColumnStatDefinitions" :key #[`item.${key}`]="{ item }">
        {{ format(item[key] as never) }}
      </template>
    </v-data-table>
  </TableEditorDialog>
  <TableEditorFileColumnChartDialog v-model="isChartOpen" :column-stats="selectedStats" />
</template>
