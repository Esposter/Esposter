<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { columnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { toRawDeep } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface EditDialogButtonProps {
  column: Column;
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<EditDialogButtonProps>();
const updateColumn = useUpdateColumn();
// StructuredClone is required here: Vjsf does not work with class instances and needs a plain object,
// And fast-deep-equal checks constructors so class instances never equal their plain object clones
const editedColumn = ref(structuredClone(toRawDeep(column)));
const title = computed(() => `Edit "${column.name}" Column`);
const jsonSchema = zodToJsonSchema(columnFormSchema);
const options = useColumnFormOptions(
  () => dataSource,
  () => column.name,
);
const resetForm = () => {
  editedColumn.value = structuredClone(toRawDeep(column));
};
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
    :title
    :tooltip-text="title"
    :schema="columnFormSchema"
    :value="columnFormSchema.safeParse(column).data"
    :edited-value="columnFormSchema.safeParse(editedColumn).data"
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
