<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { CreateFormSchemaMap } from "#shared/models/tableEditor/file/CreateFormSchemaMap";
import { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import { EditFormSchemaMap } from "#shared/models/tableEditor/file/EditFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { takeOne } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const { createColumn } = useEditedItemDataSourceOperations();
const editedColumn = ref<Column | DateColumn>(new Column());
const schema = computed(() => takeOne(CreateFormSchemaMap, editedColumn.value.type));
const jsonSchema = computed(() => zodToJsonSchema(takeOne(EditFormSchemaMap, editedColumn.value.type)));
const uniqueNameRule = useColumnNameRule(() => dataSource.columns);

watch(
  () => editedColumn.value.type,
  (newType, oldType) => {
    if (newType === oldType) return;
    const name = editedColumn.value.name;
    editedColumn.value = newType === ColumnType.Date ? new DateColumn({ name }) : new Column({ name, type: newType });
  },
);
</script>

<template>
  <TableEditorFileEditDialogButton
    title="Create Column"
    tooltip-text="Add Column"
    icon="mdi-table-column-plus-after"
    :schema
    :value="null"
    :edited-value="editedColumn"
    @submit="
      (onComplete) => {
        createColumn(editedColumn);
        onComplete();
      }
    "
  >
    <v-text-field v-model="editedColumn.name" label="Column" :rules="[uniqueNameRule]" />
    <Vjsf v-model="editedColumn" :schema="jsonSchema" />
  </TableEditorFileEditDialogButton>
</template>
