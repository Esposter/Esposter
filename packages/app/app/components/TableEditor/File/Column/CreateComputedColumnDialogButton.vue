<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ComputedColumn, computedColumnSchema } from "#shared/models/tableEditor/file/column/ComputedColumn";

interface CreateComputedColumnDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateComputedColumnDialogButtonProps>();
const createComputedColumn = useCreateComputedColumn();
const defaultColumn = new ComputedColumn();
// StructuredClone is required here: Vjsf does not work with class instances and needs a plain object
const editedColumn = ref(structuredClone(defaultColumn));
const uniqueNameRule = useColumnNameRule(() => dataSource.columns);

const resetForm = () => {
  editedColumn.value = structuredClone(defaultColumn);
};
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
    title="Create Computed Column"
    tooltip-text="Add Computed Column"
    icon="mdi-function-variant"
    :schema="computedColumnSchema"
    :value="defaultColumn"
    :edited-value="editedColumn"
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        createComputedColumn(editedColumn);
        onComplete();
      }
    "
  >
    <v-text-field v-model="editedColumn.name" label="Column" :rules="[uniqueNameRule]" />
    <TableEditorFileColumnComputedColumnForm v-model="editedColumn" />
  </TableEditorFileCrudViewEditDialogButton>
</template>
