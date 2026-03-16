<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Row, rowSchema } from "#shared/models/tableEditor/file/Row";
import { takeOne } from "@esposter/shared";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const createRow = useCreateRow();
const editedRow = ref(new Row({ data: Object.fromEntries(dataSource.columns.map((column) => [column.name, null])) }));
const resetForm = () => {
  editedRow.value = new Row({ data: Object.fromEntries(dataSource.columns.map((column) => [column.name, null])) });
};
</script>

<template>
  <TableEditorFileEditDialogButton
    title="Create Row"
    tooltip-text="Add Row"
    icon="mdi-table-row-plus-after"
    :schema="rowSchema"
    :value="null"
    :edited-value="editedRow"
    @submit="
      (onComplete) => {
        createRow(editedRow);
        onComplete();
      }
    "
  >
    <template #prepend-actions>
      <v-tooltip text="Reset form to default values">
        <template #activator="{ props: tooltipProps }">
          <v-btn text="Reset" :="tooltipProps" @click="resetForm()" />
        </template>
      </v-tooltip>
    </template>
    <v-row v-for="column of dataSource.columns.filter((column) => !column.hidden)" :key="column.id">
      <v-col cols="12">
        <TableEditorFileRowFieldInput
          :model-value="takeOne(editedRow.data, column.name)"
          :column
          @update:model-value="editedRow.data[column.name] = $event"
        />
      </v-col>
    </v-row>
  </TableEditorFileEditDialogButton>
</template>
