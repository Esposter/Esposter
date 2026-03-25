<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import {
  ComputedColumn,
  computedColumnFormSchema,
  computedColumnSchema,
} from "#shared/models/tableEditor/file/column/ComputedColumn";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { Vjsf } from "@koumoul/vjsf";

interface CreateComputedColumnDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateComputedColumnDialogButtonProps>();
const createComputedColumn = useCreateComputedColumn();
// StructuredClone is required here: Vjsf does not work with class instances and needs a plain object,
// And fast-deep-equal checks constructors so class instances never equal their plain object clones
const defaultColumn = structuredClone(new ComputedColumn());
const editedColumn = ref(structuredClone(defaultColumn));
const jsonSchema = zodToJsonSchema(computedColumnFormSchema.omit({ type: true }));
const options = computed(() => ({
  context: {
    columnNames: dataSource.columns.map(({ name }) => name),
    sourceColumnItems: dataSource.columns.map(({ id, name }) => ({ title: name, value: id })),
  },
}));

const resetForm = () => {
  editedColumn.value = structuredClone(defaultColumn);
};
</script>

<template>
  <TableEditorFileCrudViewEditDialogButton
    title="Create Computed Column"
    tooltip-text="Add Computed Column"
    icon="mdi-function-variant"
    :schema="computedColumnSchema"
    :value="defaultColumn"
    :edited-value="editedColumn"
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        createComputedColumn(editedColumn);
        onComplete();
      }
    "
  >
    <Vjsf v-model="editedColumn" :schema="jsonSchema" :options />
  </TableEditorFileCrudViewEditDialogButton>
</template>
