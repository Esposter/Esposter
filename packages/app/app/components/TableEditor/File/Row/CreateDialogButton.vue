<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { Row, rowSchema } from "#shared/models/tableEditor/file/datasource/Row";
import { isEditableColumnValue } from "@/services/tableEditor/file/column/isEditableColumnValue";
import { takeOne } from "@esposter/shared";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const createRow = useCreateRow();
const editableColumns = computed(() => dataSource.columns.filter(isEditableColumnValue));
// StructuredClone is required here: fast-deep-equal checks constructors so class instances never equal their plain object clones
const blankRow = structuredClone(
  new Row({ data: Object.fromEntries(editableColumns.value.map((column) => [column.name, null])) }),
);
const editedRow = ref(structuredClone(blankRow));
const resetForm = () => {
  editedRow.value = structuredClone(blankRow);
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
