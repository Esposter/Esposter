<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { columnFormSchema, ColumnTypeFormSchemaMap } from "@/models/resource/sheet/column/ColumnForm";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { getEditColumnDescription } from "@/services/resource/sheet/commands/getEditColumnDescription";
import { extractSchemaFields } from "@/services/zod/extractSchemaFields";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";
import { toRawDeep } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

interface Props {
  column: Column;
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<Props>();
const columnDialogStore = useColumnDialogStore();
const { editingColumnName } = storeToRefs(columnDialogStore);
const { isOpen } = useSingletonDialog(editingColumnName);
const updateColumn = useUpdateColumn();
// StructuredClone to a plain object: vjsf rejects class instances, and fast-deep-equal compares constructors.
const editedColumn = ref(structuredClone(toRawDeep(column)));
const jsonSchema = zodToJsonSchema(columnFormSchema);
const value = computed(() => extractSchemaFields(ColumnTypeFormSchemaMap[column.type], column));
const editedValue = computed(() =>
  extractSchemaFields(ColumnTypeFormSchemaMap[editedColumn.value.type], editedColumn.value),
);
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
    :title="getEditColumnDescription(column.name)"
    :edited-value
    :schema="columnFormSchema"
    :value
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
