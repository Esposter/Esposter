<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/column/ColumnTypeFormSchemaMap";
import { CreateFormSchemaMap } from "#shared/models/tableEditor/file/column/CreateFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { ColumnTypeCreateMap } from "@/services/tableEditor/file/column/ColumnTypeCreateMap";
import { ColumnTypeItemCategoryDefinitions } from "@/services/tableEditor/file/column/ColumnTypeItemCategoryDefinitions";
import { takeOne } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const createColumn = useCreateColumn();
const columnType = ref<Exclude<ColumnType, ColumnType.Computed>>(ColumnType.String);
// StructuredClone is required here: Vjsf does not work with class instances and needs a plain object,
// And fast-deep-equal checks constructors so class instances never equal their plain object clones
const defaultColumn = computed(() => structuredClone(ColumnTypeCreateMap[columnType.value].create()));
const editedColumn = ref<DataSource["columns"][number]>(structuredClone(defaultColumn.value));
const schema = computed(() => takeOne(ColumnTypeFormSchemaMap, columnType.value));
const jsonSchema = computed(() => zodToJsonSchema(takeOne(CreateFormSchemaMap, columnType.value)));
const uniqueNameRule = useColumnNameRule(() => dataSource.columns);
const resetForm = () => {
  editedColumn.value = structuredClone(defaultColumn.value);
};

watch(columnType, (newType) => {
  const name = editedColumn.value.name;
  editedColumn.value = structuredClone(ColumnTypeCreateMap[newType].create(name));
});
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
    title="Create Column"
    tooltip-text="Add Column"
    icon="mdi-table-column-plus-after"
    :schema
    :value="defaultColumn"
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
  </TableEditorFileCrudViewEditDialogButton>
</template>
