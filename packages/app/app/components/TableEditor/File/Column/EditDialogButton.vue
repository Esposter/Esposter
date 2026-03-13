<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnTypeFormSchemaWithoutNameMap } from "#shared/models/tableEditor/file/ColumnTypeFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { Vjsf } from "@koumoul/vjsf";
import deepEqual from "fast-deep-equal";

interface EditDialogButtonProps {
  column: DataSource["columns"][number];
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<EditDialogButtonProps>();
const { updateColumn } = useEditedItemDataSourceOperations();
const jsonSchema = computed(() => zodToJsonSchema(ColumnTypeFormSchemaWithoutNameMap[column.type]));
const editedColumn = ref({ ...column });
const disabled = computed(() => deepEqual(column, editedColumn.value));
const uniqueNameRule = (value: string) =>
  value === column.name || !dataSource.columns.some(({ name }) => name === value) || "Column already exists";
</script>

<template>
  <TableEditorFileEditDialogButton
    :title="`Edit ${column.name} Column`"
    tooltip-text="Edit Column"
    :disabled
    @submit="
      (onComplete) => {
        updateColumn(column.name, editedColumn);
        onComplete();
      }
    "
  >
    <v-container fluid>
      <v-text-field v-model="editedColumn.name" label="Column" :rules="[uniqueNameRule]" />
      <Vjsf v-model="editedColumn" :schema="jsonSchema" />
    </v-container>
  </TableEditorFileEditDialogButton>
</template>
