<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { EditableColumnValue } from "#shared/models/tableEditor/file/column/EditableColumnValue";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { isEditableColumnValue } from "@/services/tableEditor/file/column/isEditableColumnValue";
import { useCellStore } from "@/store/tableEditor/file/cell";
import { takeOne, toRawDeep } from "@esposter/shared";

interface EditableProps {
  column: EditableColumnValue;
  columns: Column[];
  item: Row;
  rowIndex: number;
  rows: Row[];
}

const { column, columns, item, rowIndex, rows } = defineProps<EditableProps>();
const updateRow = useUpdateRow();
const cellStore = useCellStore();
const { clearFocus, requestFocus } = cellStore;
const editableColumns = computed(() => columns.filter((column) => isEditableColumnValue(column)));
const localValue = ref<ColumnValue>(takeOne(item.data, column.name) ?? null);
let isSubmitted = false;

const submitEdit = () => {
  if (isSubmitted) return;
  isSubmitted = true;
  clearFocus();
  if (localValue.value === (takeOne(item.data, column.name) ?? null)) return;
  updateRow(
    Object.assign(structuredClone(toRawDeep(item)), { data: { ...item.data, [column.name]: localValue.value } }),
  );
};

const navigateTo = (targetRowIndex: number, targetColumnName: string) => {
  submitEdit();
  requestFocus(targetRowIndex, targetColumnName);
};
</script>

<template>
  <div
    @blur.capture="submitEdit()"
    @keydown.arrow-down.stop="rowIndex + 1 < rows.length && navigateTo(rowIndex + 1, column.name)"
    @keydown.arrow-up.stop="rowIndex - 1 >= 0 && navigateTo(rowIndex - 1, column.name)"
    @keydown.enter.stop="!$event.isComposing && submitEdit()"
    @keydown.esc.stop="clearFocus()"
    @keydown.tab.stop="
      (event) => {
        const currentIndex = editableColumns.findIndex(({ name }) => name === column.name);
        if (currentIndex === -1) return;
        const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
        if (nextIndex < 0 || nextIndex >= editableColumns.length) return;
        event.preventDefault();
        navigateTo(rowIndex, takeOne(editableColumns, nextIndex).name);
      }
    "
  >
    <TableEditorFileRowFieldInput v-model="localValue" :column autofocus hide-details inline />
  </div>
</template>
