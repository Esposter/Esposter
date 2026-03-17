<script setup lang="ts">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { KeepDuplicateMode } from "@/models/tableEditor/file/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/tableEditor/file/commands/findDuplicateRows";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
const { editedItem } = storeToRefs(tableEditorStore);
const isOpen = ref(false);
const keepMode = ref(KeepDuplicateMode.First);
const deleteDuplicateRows = useDeleteDuplicateRows();

const duplicateCount = computed(() =>
  editedItem.value?.dataSource ? findDuplicateRows(editedItem.value.dataSource).length : 0,
);

const onConfirm = () => {
  deleteDuplicateRows(keepMode.value);
  isOpen.value = false;
};
</script>

<template>
  <v-tooltip text="Remove Duplicate Rows">
    <template #activator="{ props: tooltipProps }">
      <v-btn m-0 icon="mdi-table-row-remove" size="small" tile :="tooltipProps" @click.stop="isOpen = true" />
    </template>
  </v-tooltip>
  <v-dialog v-model="isOpen" max-width="400">
    <v-card>
      <v-card-title>Duplicate Rows</v-card-title>
      <v-card-text>
        <p v-if="duplicateCount === 0">No duplicate rows found.</p>
        <p v-else>{{ duplicateCount }} duplicate row{{ duplicateCount === 1 ? "" : "s" }} will be deleted.</p>
        <v-btn-toggle v-model="keepMode" density="compact" mandatory mt-4>
          <v-btn :value="KeepDuplicateMode.First">Keep First</v-btn>
          <v-btn :value="KeepDuplicateMode.Last">Keep Last</v-btn>
        </v-btn-toggle>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="isOpen = false">Cancel</v-btn>
        <v-btn color="error" :disabled="duplicateCount === 0" @click="onConfirm">Delete Duplicates</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
