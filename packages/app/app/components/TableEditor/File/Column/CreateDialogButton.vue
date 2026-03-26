<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { columnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
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
  () => editedColumn.value.name,
);
const resetForm = () => {
  editedColumn.value = structuredClone(defaultColumn);
};
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
    title="Create Column"
    tooltip-text="Add Column"
    icon="mdi-table-column-plus-after"
    :schema="columnFormSchema"
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
    <Vjsf v-model="editedColumn" :schema="jsonSchema" :options />
  </TableEditorFileCrudViewEditDialogButton>
</template>
