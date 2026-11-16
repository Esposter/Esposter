<script setup lang="ts">
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { EditableColumnValue } from "#shared/models/resource/sheet/column/EditableColumnValue";

import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { checkIsEditableColumnValue } from "#shared/services/resource/sheet/column/checkIsEditableColumnValue";
import { useCellStore } from "#src/store/resource/sheet/cell";
import { useColumnStore } from "#src/store/resource/sheet/column";
import { useRowStore } from "#src/store/resource/sheet/row";
import { takeOne, toRawDeep } from "@esposter/shared";

interface Props {
  column: EditableColumnValue;
  item: Row;
  rowIndex: number;
}

const { column, item } = defineProps<Props>();
const updateRow = useUpdateRow();
const columnStore = useColumnStore();
const { displayColumns } = storeToRefs(columnStore);
const rowStore = useRowStore();
const { displayRows } = storeToRefs(rowStore);
const cellStore = useCellStore();
const { clearFocus, requestFocus } = cellStore;
// Tab walks the columns the grid draws, since a hidden column has no cell for the focus to land in
const editableColumns = computed(() =>
  displayColumns.value.filter((candidateColumn) => checkIsEditableColumnValue(candidateColumn)),
);
const editedValue = ref<ColumnValue>(takeOne(item.data, column.name) ?? null);
let isSubmitted = false;
// The row is written as the edit is left, and focusCell focuses the next cell straight after this, so the write is never
// Waited on and the focus never stalls behind it
const submitEdit = () => {
  if (isSubmitted) return;
  isSubmitted = true;
  clearFocus();
  if (editedValue.value === (takeOne(item.data, column.name) ?? null)) return;
  const editedRow = Object.assign(structuredClone(toRawDeep(item)), {
    data: { ...item.data, [column.name]: editedValue.value },
  });
  updateRow(new Row(editedRow));
};

const focusCell = (targetRowIndex: number, targetColumnName: string) => {
  submitEdit();
  requestFocus(targetRowIndex, targetColumnName);
};
// Escape drops the edit, so the blur of leaving the editor saves nothing
const discardEdit = () => {
  isSubmitted = true;
  clearFocus();
};
// Enter and Escape leave the editor for the table's cell it sits in, so the grid's keys go on from where the edit was
const focusGridCell = (event: KeyboardEvent) => {
  if (event.currentTarget instanceof HTMLElement)
    event.currentTarget.closest<HTMLElement>('[role="gridcell"]')?.focus();
};
</script>

<template>
  <div
    @blur.capture="submitEdit()"
    @keydown.arrow-down.stop="rowIndex + 1 < displayRows.length && focusCell(rowIndex + 1, column.name)"
    @keydown.arrow-up.stop="rowIndex - 1 >= 0 && focusCell(rowIndex - 1, column.name)"
    @keydown.enter.stop="
      (event: KeyboardEvent) => {
        if (event.isComposing) return;
        submitEdit();
        focusGridCell(event);
      }
    "
    @keydown.esc.stop="
      (event: KeyboardEvent) => {
        discardEdit();
        focusGridCell(event);
      }
    "
    @keydown.tab.stop="
      (event) => {
        const columnIndex = editableColumns.findIndex(({ name }) => name === column.name);
        if (columnIndex === -1) return;
        const nextIndex = event.shiftKey ? columnIndex - 1 : columnIndex + 1;
        if (nextIndex < 0 || nextIndex >= editableColumns.length) return;
        event.preventDefault();
        focusCell(rowIndex, takeOne(editableColumns, nextIndex).name);
      }
    "
  >
    <ResourceSheetRowFieldInput v-model="editedValue" :column is-inline />
  </div>
</template>
