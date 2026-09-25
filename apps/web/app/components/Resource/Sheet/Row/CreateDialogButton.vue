<script setup lang="ts">
import { Row, rowSchema } from "#shared/models/resource/sheet/datasource/Row";
import { getRowFormColumns } from "@/services/resource/sheet/column/getRowFormColumns";
import { createEmptyRowData } from "@/services/resource/sheet/dataSource/createEmptyRowData";
import { useSheetStore } from "@/store/resource/sheet";
import { takeOne, toRawDeep } from "@esposter/shared";

const sheetStore = useSheetStore();
const { dataSource } = storeToRefs(sheetStore);
const createRow = useCreateRow();
const rowFormColumns = computed(() => getRowFormColumns(dataSource.value.columns));
// Every stored column, hidden ones included: a new row carries a cell for each of them, and the form is what
// Narrows to the ones on screen. Derived from the sheet's columns as they are now rather than as they were when the
// Blade mounted, so a row made after a column was added, renamed or deleted is keyed by the columns the sheet has
const initialRow = computed(() => new Row({ data: createEmptyRowData(dataSource.value.columns) }));
const { cloned: editedRow, sync: resetForm } = useCloned(initialRow, {
  clone: (source) => structuredClone(toRawDeep(source)),
  deep: true,
});
</script>

<template>
  <ResourceSheetEditDialogButton
    :edited-value="editedRow"
    :schema="rowSchema"
    title="Create Row"
    tooltip-text="Add Row"
    :value="initialRow"
    :submit="() => createRow(editedRow)"
    @reset="resetForm()"
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
