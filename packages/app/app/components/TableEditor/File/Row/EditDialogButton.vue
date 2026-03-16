<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { Except } from "type-fest";

import { Row, rowSchema } from "#shared/models/tableEditor/file/Row";
import { takeOne, toRawDeep } from "@esposter/shared";

interface EditDialogButtonProps {
  columns: DataSource["columns"];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<EditDialogButtonProps>();
const { updateRow } = useEditedItemDataSourceOperations();
const title = computed(() => `Edit Row ${index + 1}`);
const rowData = ref<Except<Row, "id">>(structuredClone(toRawDeep(row)));
</script>

<template>
  <TableEditorFileEditDialogButton
    :title
    :tooltip-text="title"
    :value="row"
    :edited-value="rowData"
    :schema="rowSchema"
    @submit="
      (onComplete) => {
        updateRow(row.id, rowData);
        onComplete();
      }
    "
  >
    <v-row v-for="column of columns.filter((column) => !column.hidden)" :key="column.id">
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
