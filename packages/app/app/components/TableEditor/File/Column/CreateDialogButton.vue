<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnFormVjsfContext } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/column/ColumnTypeFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { ColumnTypeCreateMap } from "@/services/tableEditor/file/column/ColumnTypeCreateMap";
import { ColumnTypeItemCategoryDefinitions } from "@/services/tableEditor/file/column/ColumnTypeItemCategoryDefinitions";
import { Vjsf } from "@koumoul/vjsf";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const createColumn = useCreateColumn();
const columnType = ref(ColumnType.String);
// StructuredClone is required here: Vjsf does not work with class instances and needs a plain object,
// And fast-deep-equal checks constructors so class instances never equal their plain object clones
const defaultColumn = computed(() => structuredClone(ColumnTypeCreateMap[columnType.value].create()));
const editedColumn = ref<DataSource["columns"][number]>(structuredClone(defaultColumn.value));
const schema = computed(() => ColumnTypeFormSchemaMap[columnType.value]);
const jsonSchema = computed(() => zodToJsonSchema(schema.value));
const options = computed<VjsfOptions<ColumnFormVjsfContext>>(() => ({
  context: {
    columnNames: dataSource.columns.map(({ name }) => name),
    currentName: editedColumn.value.name,
    dateSourceColumnItems: dataSource.columns
      .filter(({ type }) => type === ColumnType.Date)
      .map(({ id, name }) => ({ title: name, value: id })),
    numberSourceColumnItems: dataSource.columns
      .filter(({ type }) => type === ColumnType.Number)
      .map(({ id, name }) => ({ title: name, value: id })),
    sourceColumnItems: dataSource.columns.map(({ id, name }) => ({ title: name, value: id })),
    stringSourceColumnItems: dataSource.columns
      .filter(({ type }) => type === ColumnType.String)
      .map(({ id, name }) => ({ title: name, value: id })),
  },
}));
const resetForm = () => {
  editedColumn.value = structuredClone(defaultColumn.value);
};
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
    <v-select
      v-model="columnType"
      :items="ColumnTypeItemCategoryDefinitions"
      label="Type"
      @update:model-value="resetForm()"
    />
    <Vjsf v-model="editedColumn" :schema="jsonSchema" :options />
  </TableEditorFileCrudViewEditDialogButton>
</template>
