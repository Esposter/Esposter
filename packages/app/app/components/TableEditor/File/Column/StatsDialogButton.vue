<script setup lang="ts">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { computeColumnStats } from "@/services/tableEditor/file/column/computeColumnStats";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
const { editedItem } = storeToRefs(tableEditorStore);
const isOpen = ref(false);
const columnStats = computed<ColumnStats[]>(() =>
  editedItem.value?.dataSource ? computeColumnStats(editedItem.value.dataSource) : [],
);
const headers = [
  { key: "columnName", sortable: false, title: "Column" },
  { key: "columnType", sortable: false, title: "Type" },
  { key: "nullCount", title: "Nulls" },
  { key: "uniqueCount", title: "Unique" },
  { key: "min", title: "Min" },
  { key: "max", title: "Max" },
  { key: "avg", title: "Avg" },
  { key: "trueCount", title: "True" },
  { key: "falseCount", title: "False" },
];
</script>

<template>
  <v-tooltip text="Column Statistics">
    <template #activator="{ props: tooltipProps }">
      <v-btn m-0 icon="mdi-sigma" size="small" tile :="tooltipProps" @click.stop="isOpen = true" />
    </template>
  </v-tooltip>
  <v-dialog v-model="isOpen" max-width="900">
    <v-card>
      <v-card-title>Column Statistics</v-card-title>
      <v-card-text>
        <v-data-table density="compact" item-value="columnName" :headers :items="columnStats">
          <template #[`item.uniqueCount`]="{ item }">{{ item.uniqueCount ?? "—" }}</template>
          <template #[`item.min`]="{ item }">{{ item.min ?? "—" }}</template>
          <template #[`item.max`]="{ item }">{{ item.max ?? "—" }}</template>
          <template #[`item.avg`]="{ item }">{{ item.avg ?? "—" }}</template>
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
</template>
