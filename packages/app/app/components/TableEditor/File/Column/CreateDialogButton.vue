<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/ColumnTypeFormSchemaMap";
import { CreateFormSchemaMap } from "#shared/models/tableEditor/file/CreateFormSchemaMap";
import { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { ColumnTypeItemCategoryDefinitions } from "@/services/tableEditor/file/ColumnTypeItemCategoryDefinitions";
import { takeOne } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const createColumn = useCreateColumn();
const columnType = ref(ColumnType.String);
const defaultColumn = new Column();
// StructuredClone is required here: Vjsf does not work with class instances and needs a plain object
const editedColumn = ref(structuredClone<DataSource["columns"][number]>(defaultColumn));
const resetForm = () => {
  columnType.value = ColumnType.String;
  const defaultColumn = new Column();
  editedColumn.value = structuredClone<DataSource["columns"][number]>(defaultColumn);
};
const schema = computed(() => takeOne(ColumnTypeFormSchemaMap, columnType.value));
const jsonSchema = computed(() => zodToJsonSchema(takeOne(CreateFormSchemaMap, columnType.value)));
const uniqueNameRule = useColumnNameRule(() => dataSource.columns);

watch(columnType, (newType, oldType) => {
  if (newType === oldType) return;
  const name = editedColumn.value.name;
  // StructuredClone is required here: Vjsf does not work with class instances and needs a plain object
  editedColumn.value = structuredClone(
    newType === ColumnType.Date
      ? new DateColumn({ name })
      : (new Column({ name, type: newType }) as DataSource["columns"][number]),
  );
});
</script>

<template>
  <TableEditorFileEditDialogButton
    title="Create Column"
    tooltip-text="Add Column"
    icon="mdi-table-column-plus-after"
    :schema
    :value="null"
    :edited-value="editedColumn"
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        createColumn(editedColumn);
        onComplete();
      }
    "
  >
    <v-select v-model="columnType" :items="ColumnTypeItemCategoryDefinitions" label="Type" />
    <v-text-field v-model="editedColumn.name" label="Column" :rules="[uniqueNameRule]" />
    <Vjsf v-model="editedColumn" :schema="jsonSchema" />
  </TableEditorFileEditDialogButton>
</template>
