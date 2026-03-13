<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { dayjs } from "#shared/services/dayjs";
import { takeOne } from "@esposter/shared";

interface EditDialogButtonProps {
  columns: DataSource["columns"];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<EditDialogButtonProps>();
const { updateRow } = useEditedItemDataSourceOperations();
const editedRow = ref({ ...row });
</script>

<template>
  <TableEditorFileEditDialogButton
    title="Edit Row"
    tooltip-text="Edit Row"
    @submit="
      (onComplete) => {
        updateRow(index, editedRow);
        onComplete();
      }
    "
  >
    <v-container fluid>
      <v-row v-for="column of columns" :key="column.name">
        <v-col cols="12">
          <v-checkbox v-if="column.type === ColumnType.Boolean" v-model="editedRow[column.name]" :label="column.name" />
          <v-text-field
            v-else
            :model-value="
              (() => {
                const value = takeOne(editedRow, column.name);
                if (column.type === ColumnType.Date && typeof value === 'string') {
                  const date = dayjs(value, column.format, true);
                  if (date.isValid()) return date.format('YYYY-MM-DD');
                  return value;
                } else return value;
              })()
            "
            :label="column.name"
            :type="column.type === ColumnType.Number ? 'number' : column.type === ColumnType.Date ? 'date' : 'text'"
            density="compact"
            @update:model-value="
              editedRow[column.name] =
                column.type === ColumnType.Date ? dayjs($event, 'YYYY-MM-DD').format(column.format) : $event
            "
          />
        </v-col>
      </v-row>
    </v-container>
  </TableEditorFileEditDialogButton>
</template>
