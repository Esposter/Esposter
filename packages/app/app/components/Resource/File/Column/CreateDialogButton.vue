<script setup lang="ts">
import type { Column } from "#shared/models/resource/file/column/Column";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { columnFormSchema, ColumnTypeFormSchemaMap } from "#shared/models/resource/file/column/ColumnForm";
import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { extractSchemaFields } from "#shared/services/zod/extractSchemaFields";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { ColumnTypeCreateMap } from "@/services/resource/file/column/ColumnTypeCreateMap";
import { Vjsf } from "@koumoul/vjsf";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const createColumn = useCreateColumn();
// StructuredClone to a plain object: vjsf rejects class instances, and fast-deep-equal compares constructors.
const defaultColumn = structuredClone(ColumnTypeCreateMap[ColumnType.String].create());
const editedColumn = ref<Column>(structuredClone(defaultColumn));
const jsonSchema = zodToJsonSchema(columnFormSchema);
const options = useColumnFormOptions(
  () => dataSource,
  () => "",
);
const resetForm = () => {
  editedColumn.value = structuredClone(defaultColumn);
};
</script>

<template>
  <ResourceFileEditDialogButton
    icon="mdi-table-column-plus-after"
    title="Create Column"
    tooltip-text="Add Column"
    :edited-value="extractSchemaFields(ColumnTypeFormSchemaMap[editedColumn.type], editedColumn)"
    :schema="columnFormSchema"
    :value="extractSchemaFields(ColumnTypeFormSchemaMap[defaultColumn.type], defaultColumn)"
    is-create
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        createColumn(editedColumn);
        onComplete();
      }
    "
  >
    <Vjsf v-model="editedColumn" :schema="jsonSchema" :options />
  </ResourceFileEditDialogButton>
</template>
