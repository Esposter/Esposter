<script setup lang="ts">
import { Row, rowSchema } from "#shared/models/resource/sheet/datasource/Row";
import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { getRowFormColumns } from "@/services/resource/sheet/column/getRowFormColumns";
import { useSheetStore } from "@/store/resource/sheet";
import { takeOne } from "@esposter/shared";

const sheetStore = useSheetStore();
const { dataSource } = storeToRefs(sheetStore);
const createRow = useCreateRow();
const rowFormColumns = computed(() => getRowFormColumns(dataSource.value.columns));
// Every editable column, hidden ones included: a new row carries a cell for each of them, and the form is what
// Narrows to the ones on screen.
const initialRow = structuredClone(
  new Row({
    data: Object.fromEntries(
      dataSource.value.columns.filter(checkIsEditableColumnValue).map(({ name }) => [name, null]),
    ),
  }),
);
const editedRow = ref(structuredClone(initialRow));
const resetForm = () => {
  editedRow.value = structuredClone(initialRow);
};
</script>

<template>
  <ResourceSheetEditDialogButton
    :edited-value="editedRow"
    :schema="rowSchema"
    title="Create Row"
    tooltip-text="Add Row"
    :value="initialRow"
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        createRow(editedRow);
        onComplete();
      }
    "
  >
    <ResourceSheetRowFieldInput
      v-for="column of rowFormColumns"
      :key="column.id"
      :model-value="takeOne(editedRow.data, column.name)"
      :column
      @update:model-value="editedRow.data[column.name] = $event"
    />
  </ResourceSheetEditDialogButton>
</template>
