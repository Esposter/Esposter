<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { ColumnFormVjsfContext } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import type { VjsfOptions } from "@/models/vjsf/VjsfOptions";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/column/ColumnTypeFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { ColumnTypeCreateMap } from "@/services/tableEditor/file/column/ColumnTypeCreateMap";
import { ColumnTypeItemCategoryDefinitions } from "@/services/tableEditor/file/column/ColumnTypeItemCategoryDefinitions";
import { toRawDeep } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface EditDialogButtonProps {
  column: DataSource["columns"][number];
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<EditDialogButtonProps>();
const updateColumn = useUpdateColumn();
const columnType = ref(column.type);
const schema = computed(() => ColumnTypeFormSchemaMap[columnType.value]);
const jsonSchema = computed(() => zodToJsonSchema(schema.value));
const options = computed<VjsfOptions<ColumnFormVjsfContext>>(() => ({
  context: {
    columnNames: dataSource.columns.map(({ name }) => name),
    currentName: column.name,
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
const editedColumn = ref(structuredClone(toRawDeep(column)));
const title = computed(() => `Edit "${column.name}" Column`);
const resetForm = () => {
  editedColumn.value = structuredClone(toRawDeep(column));
  columnType.value = column.type;
};
const onColumnTypeUpdate = (type: ColumnType) => {
  editedColumn.value = structuredClone(ColumnTypeCreateMap[type].create());
};
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
    :title
    :tooltip-text="title"
    :schema
    :value="column"
    :edited-value="editedColumn"
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        updateColumn(column.name, editedColumn);
        onComplete();
      }
    "
  >
    <v-select
      v-model="columnType"
      :items="ColumnTypeItemCategoryDefinitions"
      label="Type"
      @update:model-value="onColumnTypeUpdate($event)"
    />
    <Vjsf v-model="editedColumn" :schema="jsonSchema" :options />
  </TableEditorFileCrudViewEditDialogButton>
</template>
