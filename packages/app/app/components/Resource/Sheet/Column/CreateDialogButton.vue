<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { columnFormSchema, ColumnTypeFormSchemaMap } from "@/models/resource/sheet/column/ColumnForm";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { ColumnTypeCreateMap } from "@/services/resource/sheet/column/ColumnTypeCreateMap";
import { extractSchemaFields } from "@/services/zod/extractSchemaFields";
import { Vjsf } from "@koumoul/vjsf";

interface Props {
  dataSource: DataSource;
}

const { dataSource } = defineProps<Props>();
const createColumn = useCreateColumn();
const initialColumn = structuredClone(ColumnTypeCreateMap[ColumnType.String].create());
const editedColumn = ref<Column>(structuredClone(initialColumn));
const jsonSchema = zodToJsonSchema(columnFormSchema);
const value = extractSchemaFields(ColumnTypeFormSchemaMap[initialColumn.type], initialColumn);
const editedValue = computed(() =>
  extractSchemaFields(ColumnTypeFormSchemaMap[editedColumn.value.type], editedColumn.value),
);
const options = useColumnFormOptions(
  () => dataSource,
  () => "",
);
const resetForm = () => {
  editedColumn.value = structuredClone(initialColumn);
};
</script>

<template>
  <ResourceSheetEditDialogButton
    icon="mdi-table-column-plus-after"
    title="Create Column"
    tooltip-text="Add Column"
    :edited-value
    :schema="columnFormSchema"
    :value
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        createColumn(editedColumn);
        onComplete();
      }
    "
  >
    <Vjsf v-model="editedColumn" :schema="jsonSchema" :options />
  </ResourceSheetEditDialogButton>
</template>
