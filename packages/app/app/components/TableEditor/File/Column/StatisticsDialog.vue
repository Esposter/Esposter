<script setup lang="ts">
import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnStatisticDefinitions } from "@/services/tableEditor/file/column/ColumnStatisticDefinitionMap";

const isOpen = defineModel<boolean>();
const columnStatistics = useColumnStatistics();
const isChartOpen = ref(false);
const selectedStatistics = ref<ColumnStatistics | null>(null);
const headers = [
  { key: "chart", sortable: false, title: "" },
  { key: "columnName", sortable: false, title: "Column" },
  { key: "columnType", sortable: false, title: "Type" },
  ...[...ColumnStatisticDefinitions].map(({ key, sortable, title }) => ({ key, sortable, title })),
];
const openChart = (statistics: ColumnStatistics) => {
  selectedStatistics.value = statistics;
  isChartOpen.value = true;
};
</script>

<template>
  <TableEditorDialog v-model="isOpen" title="Column Statistics">
    <v-data-table density="compact" item-value="columnName" :headers :items="columnStatistics">
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
      <template v-for="{ key, format } of ColumnStatisticDefinitions" :key #[`item.${key}`]="{ item }">
        {{ format(item[key] as never) }}
      </template>
    </v-data-table>
  </TableEditorDialog>
  <TableEditorFileColumnChartDialog v-model="isChartOpen" :column-statistics="selectedStatistics" />
</template>
