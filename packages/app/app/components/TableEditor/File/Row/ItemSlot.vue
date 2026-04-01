<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { computeValue } from "@/services/tableEditor/file/column/computeValue";
import { isEditableColumnValue } from "@/services/tableEditor/file/column/isEditableColumnValue";
import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/tableEditor/file/constants";
import { getItemId } from "@/services/tableEditor/file/getItemId";
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
const { clearFocus, pendingFocusCell, requestFocus } = useTableCellNavigation();
const editableColumn = computed(() => (isEditableColumnValue(column) ? column : null));
const editableColumns = computed(() => columns.filter((column) => isEditableColumnValue(column)));
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

const commitEdit = () => {
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

const navigateTo = (targetRowIndex: number, targetColumnName: string) => {
  commitEdit();
  requestFocus(targetRowIndex, targetColumnName);
};

const onTab = (event: KeyboardEvent) => {
  const currentIndex = editableColumns.value.findIndex(({ name }) => name === column.name);
  if (currentIndex === -1) return;
  const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0 || nextIndex >= editableColumns.value.length) return;
  event.preventDefault();
  navigateTo(rowIndex, takeOne(editableColumns.value, nextIndex).name);
};
</script>

<template>
  <div
    v-if="isEditing && editableColumn"
    @blur.capture="commitEdit"
    @keydown.arrow-down.stop="rowIndex + 1 < rows.length && navigateTo(rowIndex + 1, column.name)"
    @keydown.arrow-up.stop="rowIndex - 1 >= 0 && navigateTo(rowIndex - 1, column.name)"
    @keydown.enter.stop="!$event.isComposing && commitEdit()"
    @keydown.esc.stop="cancelEdit"
    @keydown.tab.stop="onTab($event)"
  >
    <TableEditorFileRowFieldInput v-model="localValue" :column="editableColumn" autofocus hide-details inline />
  </div>
  <div v-else @dblclick.stop="startEditing">
    <TableEditorFileFindReplaceHighlight
      v-if="findValue"
      :class="{ [OUTLIER_HIGHLIGHT_CLASS]: isOutlier }"
      :is-current-occurrence
      :search="findValue"
      :text
    />
    <TableEditorFileRowOutlierHighlight v-else :is-outlier :text />
  </div>
</template>
