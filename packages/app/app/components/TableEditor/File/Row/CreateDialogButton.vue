<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { Except } from "type-fest";

import { Row, rowSchema } from "#shared/models/tableEditor/file/Row";
import { takeOne } from "@esposter/shared";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const { createRow } = useEditedItemDataSourceOperations();
const rowData = ref<Except<Row, "id">>(
  new Row({ data: Object.fromEntries(dataSource.columns.map((column) => [column.name, null])) }),
);
const resetForm = () => {
  rowData.value = new Row({ data: Object.fromEntries(dataSource.columns.map((column) => [column.name, null])) });
};
</script>

<template>
  <TableEditorFileEditDialogButton
    title="Create Row"
    tooltip-text="Add Row"
    icon="mdi-table-row-plus-after"
    :schema="rowSchema"
    :value="null"
    :edited-value="rowData"
    @submit="
      (onComplete) => {
        createRow(rowData);
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
          :model-value="takeOne(rowData.data, column.name)"
          :column
          @update:model-value="rowData.data[column.name] = $event"
        />
      </v-col>
    </v-row>
  </TableEditorFileEditDialogButton>
</template>
