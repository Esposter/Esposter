<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/column/ColumnTypeFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { takeOne, toRawDeep } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface EditDialogButtonProps {
  column: DataSource["columns"][number];
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<EditDialogButtonProps>();
const updateColumn = useUpdateColumn();
const schema = computed(() => takeOne(ColumnTypeFormSchemaMap, column.type));
const jsonSchema = computed(() => zodToJsonSchema(takeOne(ColumnTypeFormSchemaMap, column.type)));
const options = computed(() => ({
  context: {
    columnNames: dataSource.columns.map(({ name }) => name),
    currentName: column.name,
    sourceColumnItems: dataSource.columns.map(({ id, name }) => ({ title: name, value: id })),
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
    <Vjsf v-model="editedColumn" :schema="jsonSchema" :options />
  </TableEditorFileCrudViewEditDialogButton>
</template>
