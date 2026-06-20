<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { rowSchema } from "#shared/models/tableEditor/file/datasource/Row";
import { checkIsEditableColumnValue } from "@/services/tableEditor/file/column/checkIsEditableColumnValue";
import { takeOne, toRawDeep } from "@esposter/shared";

interface EditDialogButtonProps {
  columns: DataSource["columns"];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<EditDialogButtonProps>();
const editableColumns = computed(() => columns.filter((column) => checkIsEditableColumnValue(column)));
const updateRow = useUpdateRow();
const title = computed(() => `Edit Row ${index + 1}`);
const { cloned: editedRow, sync: resetForm } = useCloned(() => row, {
  clone: (source) => structuredClone(toRawDeep(source)),
  deep: true,
});
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
    :title
    :tooltip-text="title"
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
        <TableEditorFileRowFieldInput
          :model-value="takeOne(editedRow.data, column.name)"
          :column
          @update:model-value="editedRow.data[column.name] = $event"
        />
      </v-col>
    </v-row>
  </TableEditorFileCrudViewEditDialogButton>
</template>
