<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Row, rowSchema } from "#shared/models/tableEditor/file/Row";
import { takeOne } from "@esposter/shared";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const createRow = useCreateRow();
const blankRow = new Row({ data: Object.fromEntries(dataSource.columns.map((column) => [column.name, null])) });
const editedRow = ref(new Row({ ...blankRow, data: { ...blankRow.data } }));
const resetForm = () => {
  editedRow.value = new Row({ ...blankRow, data: { ...blankRow.data } });
};
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
    title="Create Row"
    tooltip-text="Add Row"
    icon="mdi-table-row-plus-after"
    :schema="rowSchema"
    :value="blankRow"
    :edited-value="editedRow"
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        createRow(editedRow);
        onComplete();
      }
    "
  >
    <v-row v-for="column of dataSource.columns.filter((column) => !column.hidden)" :key="column.id">
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
