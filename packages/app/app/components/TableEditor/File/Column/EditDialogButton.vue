<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { columnTypeFormSchema } from "#shared/models/tableEditor/file/column/ColumnTypeForm";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { toRawDeep } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface EditDialogButtonProps {
  column: DataSource["columns"][number];
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<EditDialogButtonProps>();
const updateColumn = useUpdateColumn();
const jsonSchema = zodToJsonSchema(columnTypeFormSchema);
const options = computed(() => ({
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
};
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
    :title
    :tooltip-text="title"
    :schema="columnTypeFormSchema"
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
    <Vjsf v-model="editedColumn" :schema="jsonSchema" :options />
  </TableEditorFileCrudViewEditDialogButton>
</template>
