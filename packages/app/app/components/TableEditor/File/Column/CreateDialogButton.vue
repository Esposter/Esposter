<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { columnFormSchema, ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/column/ColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { extractSchemaFields } from "#shared/services/zod/extractSchemaFields";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { ColumnTypeCreateMap } from "@/services/tableEditor/file/column/ColumnTypeCreateMap";
import { Vjsf } from "@koumoul/vjsf";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const createColumn = useCreateColumn();
// StructuredClone is required here: Vjsf does not work with class instances and needs a plain object,
// And fast-deep-equal checks constructors so class instances never equal their plain object clones
const defaultColumn = structuredClone(ColumnTypeCreateMap[ColumnType.String].create());
const editedColumn = ref<Column>(structuredClone(defaultColumn));
const jsonSchema = zodToJsonSchema(columnFormSchema);
const options = useColumnFormOptions(
  () => dataSource,
  () => "",
);
// Toggled on reset to force Vjsf to remount — replacing editedColumn alone does not reset
// Vjsf's internal discriminated-union selection (e.g. the type dropdown stays on the old value)
const vjsfKey = ref(false);
const resetForm = () => {
  editedColumn.value = structuredClone(defaultColumn);
  vjsfKey.value = !vjsfKey.value;
};
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
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
    <Vjsf :key="vjsfKey.toString()" v-model="editedColumn" :schema="jsonSchema" :options />
  </TableEditorFileCrudViewEditDialogButton>
</template>
