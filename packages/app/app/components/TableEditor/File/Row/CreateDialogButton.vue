<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { Row, rowSchema } from "#shared/models/tableEditor/file/datasource/Row";
import { checkIsEditableColumnValue } from "@/services/tableEditor/file/column/checkIsEditableColumnValue";
import { takeOne } from "@esposter/shared";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const createRow = useCreateRow();
const editableColumns = computed(() => dataSource.columns.filter(checkIsEditableColumnValue));
// StructuredClone to a plain object: fast-deep-equal compares constructors, so class instances never equal their clones.
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
    :edited-value="editedRow"
    icon="mdi-table-row-plus-after"
    :schema="rowSchema"
    title="Create Row"
    tooltip-text="Add Row"
    :value="blankRow"
    is-create
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
