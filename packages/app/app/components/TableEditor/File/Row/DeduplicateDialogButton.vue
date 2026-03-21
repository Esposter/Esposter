<script setup lang="ts">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { IndexedRow } from "@/models/tableEditor/file/commands/IndexedRow";

import { KeepDuplicateMode } from "@/models/tableEditor/file/commands/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/tableEditor/file/commands/findDuplicateRows";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne } from "@esposter/shared";

const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
const { editedItem } = storeToRefs(tableEditorStore);
const isOpen = ref(false);
const keepMode = ref(KeepDuplicateMode.First);
const deleteDuplicateRows = useDeleteDuplicateRows();
const duplicateRowEntries = computed<IndexedRow[]>(() =>
  editedItem.value?.dataSource ? findDuplicateRows(editedItem.value.dataSource, keepMode.value) : [],
);
const duplicateCount = computed(() => duplicateRowEntries.value.length);
const duplicateHeaders = computed(() => {
  if (!editedItem.value?.dataSource) return [];
  return [
    { key: "index", title: "#", value: (entry: IndexedRow) => entry.index },
    ...editedItem.value.dataSource.columns
      .filter((column) => !column.hidden)
      .map((column) => ({
        key: column.name,
        title: column.name,
        value: (entry: IndexedRow) => {
          const value = takeOne(entry.row.data, column.name);
          return value === null ? "" : String(value);
        },
      })),
  ];
});
</script>

<template>
  <v-tooltip text="Remove Duplicate Rows">
    <template #activator="{ props: tooltipProps }">
      <v-btn m-0 icon="mdi-table-row-remove" size="small" tile :="tooltipProps" @click.stop="isOpen = true" />
    </template>
  </v-tooltip>
  <TableEditorDialog v-model="isOpen" close-button-text="Cancel" title="Duplicate Rows">
    <p v-if="duplicateCount === 0">No duplicate rows found.</p>
    <template v-else>
      <p>{{ duplicateCount }} duplicate row{{ duplicateCount === 1 ? "" : "s" }} will be deleted.</p>
      <v-btn-toggle v-model="keepMode" density="compact" mandatory mt-4>
        <v-btn :value="KeepDuplicateMode.First">Keep First</v-btn>
        <v-btn :value="KeepDuplicateMode.Last">Keep Last</v-btn>
      </v-btn-toggle>
      <v-data-table
        mt-4
        density="compact"
        item-value="index"
        :headers="duplicateHeaders"
        :items="duplicateRowEntries"
      />
    </template>
    <template #actions>
      <v-btn
        color="error"
        :disabled="duplicateCount === 0"
        @click="
          () => {
            deleteDuplicateRows(keepMode);
            isOpen = false;
          }
        "
      >
        Delete Duplicates
      </v-btn>
    </template>
  </TableEditorDialog>
</template>
