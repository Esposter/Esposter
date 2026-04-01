<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { computeValue } from "@/services/tableEditor/file/column/computeValue";
import { isEditableColumnValue } from "@/services/tableEditor/file/column/isEditableColumnValue";
import { getItemId } from "@/services/tableEditor/file/getItemId";
import { useCellStore } from "@/store/tableEditor/file/cell";
import { useFindReplaceStore } from "@/store/tableEditor/file/findReplace";
import { useOutlierStore } from "@/store/tableEditor/file/outlier";
import { takeOne, toRawDeep } from "@esposter/shared";

interface ItemSlotProps {
  column: Column;
  columns: Column[];
  item: Row;
  rowIndex: number;
  rows: Row[];
}

const { column, columns, item, rowIndex, rows } = defineProps<ItemSlotProps>();
const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, occurrences } = storeToRefs(findReplaceStore);
const outlierStore = useOutlierStore();
const { outlierCells } = storeToRefs(outlierStore);
const updateRow = useUpdateRow();
const cellStore = useCellStore();
const { pendingFocusCell } = storeToRefs(cellStore);
const { clearFocus } = cellStore;
const editableColumn = computed(() => (isEditableColumnValue(column) ? column : null));
const currentOccurrence = computed(() => occurrences.value.at(currentOccurrenceIndex.value));
const text = computed(() => {
  const value = computeValue(rows, item, columns, column, rowIndex);
  return value === null ? "" : String(value);
});
const isCurrentOccurrence = computed(
  () => currentOccurrence.value?.rowIndex === rowIndex && currentOccurrence.value?.columnName === column.name,
);
const isOutlier = computed(() => outlierCells.value.has(getItemId(item.id, column.name)));
const isEditing = ref(false);
const localValue = ref<ColumnValue>(null);

const startEditing = () => {
  if (!editableColumn.value) return;
  localValue.value = takeOne(item.data, column.name) ?? null;
  isEditing.value = true;
};

const submitEdit = () => {
  if (!isEditing.value) return;
  isEditing.value = false;
  if (localValue.value === (takeOne(item.data, column.name) ?? null)) return;
  updateRow(
    Object.assign(structuredClone(toRawDeep(item)), { data: { ...item.data, [column.name]: localValue.value } }),
  );
};

const cancelEdit = () => {
  isEditing.value = false;
};

watch(pendingFocusCell, (newPendingFocusCell) => {
  if (newPendingFocusCell?.rowIndex !== rowIndex || newPendingFocusCell.columnName !== column.name) return;
  clearFocus();
  startEditing();
});
</script>

<template>
  <TableEditorFileRowFieldEditable
    v-if="isEditing && editableColumn"
    v-model="localValue"
    :column="editableColumn"
    :columns
    :row-index
    :rows
    @cancel="cancelEdit"
    @submit="submitEdit"
  />
  <TableEditorFileRowField v-else :find-value :is-current-occurrence :is-outlier :text @edit="startEditing()" />
</template>
