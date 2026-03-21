<script setup lang="ts">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
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
  { key: "nullCount", title: "Nulls" },
  { key: "uniqueCount", title: "Unique" },
  { key: "minimum", title: "Minimum" },
  { key: "maximum", title: "Maximum" },
  { key: "average", title: "Average" },
  { key: "standardDeviation", title: "Standard Deviation" },
  { key: "trueCount", title: "True" },
  { key: "falseCount", title: "False" },
];
const openChart = (stats: ColumnStats) => {
  selectedStats.value = stats;
  isChartOpen.value = true;
};
</script>

<template>
  <v-dialog v-model="isOpen" max-width="900">
    <v-card>
      <v-card-title>Column Statistics</v-card-title>
      <v-card-text>
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
          <template #[`item.uniqueCount`]="{ item }">{{ item.uniqueCount ?? "—" }}</template>
          <template #[`item.minimum`]="{ item }">{{ item.minimum ?? "—" }}</template>
          <template #[`item.maximum`]="{ item }">{{ item.maximum ?? "—" }}</template>
          <template #[`item.average`]="{ item }">{{ item.average ?? "—" }}</template>
          <template #[`item.standardDeviation`]="{ item }">{{ item.standardDeviation ?? "—" }}</template>
          <template #[`item.trueCount`]="{ item }">{{ item.trueCount ?? "—" }}</template>
          <template #[`item.falseCount`]="{ item }">{{ item.falseCount ?? "—" }}</template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="isOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <TableEditorFileColumnChartDialog v-model="isChartOpen" :column-stats="selectedStats" />
</template>
