<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { columnFormSchema } from "@/models/resource/sheet/column/ColumnForm";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { ColumnTypeCreateMap } from "@/services/resource/sheet/column/ColumnTypeCreateMap";
import { ColumnTypeFormSchemaMap } from "@/services/resource/sheet/column/ColumnTypeFormSchemaMap";
import { extractSchemaFields } from "@/services/zod/extractSchemaFields";

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
const { context, schema } = useColumnForm(
  () => dataSource,
  () => "",
);
const resetForm = () => {
  editedColumn.value = structuredClone(initialColumn);
};
</script>

<template>
  <ResourceSheetEditDialogButton
    title="Create Column"
    tooltip-text="Add Column"
    :edited-value
    :schema
    :value
    :submit="() => createColumn(editedColumn)"
    @reset="resetForm()"
  >
    <UiSchemaForm v-model="editedColumn" :context :schema="jsonSchema" :validation-schema="schema" />
  </ResourceSheetEditDialogButton>
</template>
