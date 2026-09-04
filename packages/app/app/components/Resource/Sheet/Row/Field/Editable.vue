<script setup lang="ts">
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { EditableColumnValue } from "@/models/resource/sheet/column/EditableColumnValue";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useRowStore } from "@/store/resource/sheet/row";
import { takeOne, toRawDeep } from "@esposter/shared";

interface Props {
  column: EditableColumnValue;
  item: Row;
  rowIndex: number;
}

const { column, item, rowIndex } = defineProps<Props>();
const updateRow = useUpdateRow();
const columnStore = useColumnStore();
const { columns } = storeToRefs(columnStore);
const rowStore = useRowStore();
const { filteredRows } = storeToRefs(rowStore);
const cellStore = useCellStore();
const { clearFocus, requestFocus } = cellStore;
const editableColumns = computed(() =>
  columns.value.filter((candidateColumn) => checkIsEditableColumnValue(candidateColumn)),
);
const localValue = ref<ColumnValue>(takeOne(item.data, column.name) ?? null);
let isSubmitted = false;
// Fire-and-forget: navigateTo focuses the next cell straight after this, and awaiting the row save
// Would stall focus behind the network round-trip on every keyboard move.
const submitEdit = getSynchronizedFunction(async () => {
  if (isSubmitted) return;
  isSubmitted = true;
  clearFocus();
  if (localValue.value === (takeOne(item.data, column.name) ?? null)) return;
  await updateRow(
    Object.assign(structuredClone(toRawDeep(item)), { data: { ...item.data, [column.name]: localValue.value } }),
  );
});

const navigateTo = (targetRowIndex: number, targetColumnName: string) => {
  submitEdit();
  requestFocus(targetRowIndex, targetColumnName);
};
</script>

<template>
  <div
    @blur.capture="submitEdit()"
    @keydown.arrow-down.stop="rowIndex + 1 < filteredRows.length && navigateTo(rowIndex + 1, column.name)"
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
    <ResourceSheetRowFieldInput v-model="localValue" :column autofocus is-inline />
  </div>
</template>
