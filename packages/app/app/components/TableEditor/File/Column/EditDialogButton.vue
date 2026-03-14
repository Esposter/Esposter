<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/ColumnTypeFormSchemaMap";
import { EditFormSchemaMap } from "#shared/models/tableEditor/file/EditFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { takeOne, toRawDeep } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface EditDialogButtonProps {
  column: DataSource["columns"][number];
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<EditDialogButtonProps>();
const { updateColumn } = useEditedItemDataSourceOperations();
const schema = computed(() => takeOne(ColumnTypeFormSchemaMap, column.type));
const jsonSchema = computed(() => zodToJsonSchema(takeOne(EditFormSchemaMap, column.type)));
const editedColumn = ref(structuredClone(toRawDeep(column)));
const uniqueNameRule = useColumnNameRule(() => dataSource.columns, column.name);
</script>

<template>
  <TableEditorFileEditDialogButton
    :title="`Edit ${column.name} Column`"
    tooltip-text="Edit Column"
    :schema
    :value="column"
    :edited-value="editedColumn"
    @submit="
      (onComplete) => {
        updateColumn(column.name, editedColumn);
        onComplete();
      }
    "
  >
    <v-text-field v-model="editedColumn.name" label="Column" :rules="[uniqueNameRule]" />
    <Vjsf v-model="editedColumn" :schema="jsonSchema" />
  </TableEditorFileEditDialogButton>
</template>
