<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { Row, rowSchema } from "#shared/models/resource/sheet/datasource/Row";
import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { getRowFormColumns } from "@/services/resource/sheet/column/getRowFormColumns";
import { takeOne } from "@esposter/shared";

interface CreateDialogButtonProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<CreateDialogButtonProps>();
const createRow = useCreateRow();
// Every editable column, hidden ones included: a new row carries a cell for each of them, and the form is what
// Narrows to the ones on screen
const editableColumns = computed(() => dataSource.columns.filter(checkIsEditableColumnValue));
const rowFormColumns = computed(() => getRowFormColumns(dataSource.columns));
// StructuredClone to a plain object: fast-deep-equal compares constructors, so class instances never equal their clones.
const blankRow = structuredClone(
  new Row({ data: Object.fromEntries(editableColumns.value.map((column) => [column.name, null])) }),
);
const editedRow = ref(structuredClone(blankRow));
const resetForm = () => {
  editedRow.value = structuredClone(blankRow);
};
</script>

<template>
  <ResourceSheetEditDialogButton
    :edited-value="editedRow"
    icon="mdi-table-row-plus-after"
    :schema="rowSchema"
    title="Create Row"
    tooltip-text="Add Row"
    :value="blankRow"
    is-create
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        createRow(editedRow);
        onComplete();
      }
    "
  >
    <v-row v-for="column of rowFormColumns" :key="column.id">
      <v-col cols="12">
        <ResourceSheetRowFieldInput
          :model-value="takeOne(editedRow.data, column.name)"
          :column
          @update:model-value="editedRow.data[column.name] = $event"
        />
      </v-col>
    </v-row>
  </ResourceSheetEditDialogButton>
</template>
