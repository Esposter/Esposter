<script setup lang="ts">
import type { Column } from "#shared/models/resource/file/column/Column";
import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";
import type { EditableColumnValue } from "#shared/models/resource/file/column/EditableColumnValue";
import type { Row } from "#shared/models/resource/file/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/resource/file/column/checkIsEditableColumnValue";
import { useCellStore } from "@/store/resource/file/cell";
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
const editableColumns = computed(() => columns.filter((column) => checkIsEditableColumnValue(column)));
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
    <ResourceFileRowFieldInput v-model="localValue" :column autofocus hide-details is-inline />
  </div>
</template>
