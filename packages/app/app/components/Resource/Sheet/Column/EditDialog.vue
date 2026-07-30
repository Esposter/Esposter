<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { columnFormSchema, ColumnTypeFormSchemaMap } from "#shared/models/resource/sheet/column/ColumnForm";
import { extractSchemaFields } from "#shared/services/zod/extractSchemaFields";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";
import { toRawDeep } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface EditDialogProps {
  column: Column;
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<EditDialogProps>();
const columnDialogStore = useColumnDialogStore();
const { editingColumnName } = storeToRefs(columnDialogStore);
const { isOpen } = useSingletonDialog(editingColumnName);
const updateColumn = useUpdateColumn();
// StructuredClone to a plain object: vjsf rejects class instances, and fast-deep-equal compares constructors.
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
  <ResourceSheetEditDialog
    v-model="isOpen"
    :title
    :edited-value="extractSchemaFields(ColumnTypeFormSchemaMap[editedColumn.type], editedColumn)"
    :schema="columnFormSchema"
    :value="extractSchemaFields(ColumnTypeFormSchemaMap[column.type], column)"
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        updateColumn(column.name, editedColumn);
        onComplete();
      }
    "
  >
    <Vjsf v-model="editedColumn" :schema="jsonSchema" :options />
  </ResourceSheetEditDialog>
</template>
