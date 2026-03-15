<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { rowSchema } from "#shared/models/tableEditor/file/Row";
import { toRawDeep } from "@esposter/shared";

interface EditDialogButtonProps {
  columns: DataSource["columns"];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<EditDialogButtonProps>();
const { updateRow } = useEditedItemDataSourceOperations();
const title = computed(() => `Edit Row ${index + 1}`);
const editedRow = ref(structuredClone(toRawDeep(row)));
</script>

<template>
  <TableEditorFileEditDialogButton
    :title
    :tooltip-text="title"
    :value="row"
    :edited-value="editedRow"
    :schema="rowSchema"
    @submit="
      (onComplete) => {
        updateRow(row.id, editedRow);
        onComplete();
      }
    "
  >
    <v-row v-for="column of columns.filter((column) => !column.hidden)" :key="column.id">
      <v-col cols="12">
        <TableEditorFileRowFieldInput v-model="editedRow.data[column.name]" :column />
      </v-col>
    </v-row>
  </TableEditorFileEditDialogButton>
</template>
