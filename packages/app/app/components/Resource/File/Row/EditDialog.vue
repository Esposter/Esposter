<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { rowSchema } from "#shared/models/resource/file/datasource/Row";
import { checkIsEditableColumnValue } from "@/services/resource/file/column/checkIsEditableColumnValue";
import { useRowDialogStore } from "@/store/resource/file/rowDialog";
import { takeOne, toRawDeep } from "@esposter/shared";

interface EditDialogProps {
  columns: DataSource["columns"];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<EditDialogProps>();
const rowDialogStore = useRowDialogStore();
const { editingId } = storeToRefs(rowDialogStore);
const isOpen = computed({
  get: () => Boolean(editingId.value),
  set: (value) => {
    if (value) return;
    editingId.value = "";
  },
});
const editableColumns = computed(() => columns.filter((column) => checkIsEditableColumnValue(column)));
const updateRow = useUpdateRow();
const title = computed(() => `Edit Row ${index + 1}`);
const { cloned: editedRow, sync: resetForm } = useCloned(() => row, {
  clone: (source) => structuredClone(toRawDeep(source)),
  deep: true,
});
</script>

<template>
  <ResourceFileEditDialog
    v-model="isOpen"
    :title
    :value="row"
    :edited-value="editedRow"
    :schema="rowSchema"
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        updateRow(editedRow);
        onComplete();
      }
    "
  >
    <v-row v-for="column of editableColumns.filter((column) => !column.hidden)" :key="column.id">
      <v-col cols="12">
        <ResourceFileRowFieldInput
          :model-value="takeOne(editedRow.data, column.name)"
          :column
          @update:model-value="editedRow.data[column.name] = $event"
        />
      </v-col>
    </v-row>
  </ResourceFileEditDialog>
</template>
