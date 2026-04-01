<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { EditableColumnValue } from "#shared/models/tableEditor/file/column/EditableColumnValue";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { isEditableColumnValue } from "@/services/tableEditor/file/column/isEditableColumnValue";
import { useCellStore } from "@/store/tableEditor/file/cell";
import { takeOne } from "@esposter/shared";

interface EditableProps {
  column: EditableColumnValue;
  columns: Column[];
  rowIndex: number;
  rows: Row[];
}

const { column, columns, rowIndex, rows } = defineProps<EditableProps>();
const modelValue = defineModel<ColumnValue>({ required: true });
const emit = defineEmits<{
  cancel: [];
  submit: [];
}>();
const cellStore = useCellStore();
const { requestFocus } = cellStore;
const editableColumns = computed(() => columns.filter((c) => isEditableColumnValue(c)));

const navigateTo = (targetRowIndex: number, targetColumnName: string) => {
  emit("submit");
  requestFocus(targetRowIndex, targetColumnName);
};
</script>

<template>
  <div
    @blur.capture="emit('submit')"
    @keydown.arrow-down.stop="rowIndex + 1 < rows.length && navigateTo(rowIndex + 1, column.name)"
    @keydown.arrow-up.stop="rowIndex - 1 >= 0 && navigateTo(rowIndex - 1, column.name)"
    @keydown.enter.stop="!$event.isComposing && emit('submit')"
    @keydown.esc.stop="emit('cancel')"
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
    <TableEditorFileRowFieldInput v-model="modelValue" :column autofocus hide-details inline />
  </div>
</template>
