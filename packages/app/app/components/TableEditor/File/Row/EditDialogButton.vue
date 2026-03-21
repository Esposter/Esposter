<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { rowSchema } from "#shared/models/tableEditor/file/Row";
import { takeOne, toRawDeep } from "@esposter/shared";

interface EditDialogButtonProps {
  columns: DataSource["columns"];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<EditDialogButtonProps>();
const updateRow = useUpdateRow();
const title = computed(() => `Edit Row ${index + 1}`);
const editedRow = ref(structuredClone(toRawDeep(row)));

watch(
  () => row,
  (newRow) => {
    editedRow.value = structuredClone(toRawDeep(newRow));
  },
  { deep: true },
);

const resetForm = () => {
  editedRow.value = structuredClone(toRawDeep(row));
};
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
    :title
    :tooltip-text="title"
    :value="row"
    :edited-value="editedRow"
    :schema="rowSchema"
    @submit="
      (onComplete) => {
        updateRow(editedRow);
        onComplete();
      }
    "
    @reset="resetForm()"
  >
    <v-row v-for="column of columns.filter((column) => !column.hidden)" :key="column.id">
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
