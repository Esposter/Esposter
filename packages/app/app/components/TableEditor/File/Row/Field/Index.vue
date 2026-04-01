<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { computeValue } from "@/services/tableEditor/file/column/computeValue";
import { isEditableColumnValue } from "@/services/tableEditor/file/column/isEditableColumnValue";
import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/tableEditor/file/constants";
import { getItemId } from "@/services/tableEditor/file/getItemId";
import { useCellStore } from "@/store/tableEditor/file/cell";
import { useFindReplaceStore } from "@/store/tableEditor/file/findReplace";
import { useOutlierStore } from "@/store/tableEditor/file/outlier";

interface FieldProps {
  column: Column;
  columns: Column[];
  item: Row;
  rowIndex: number;
  rows: Row[];
}

const { column, columns, item, rowIndex, rows } = defineProps<FieldProps>();
const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, occurrences } = storeToRefs(findReplaceStore);
const outlierStore = useOutlierStore();
const { outlierCells } = storeToRefs(outlierStore);
const { requestFocus } = useCellStore();
const currentOccurrence = computed(() => occurrences.value.at(currentOccurrenceIndex.value));
const text = computed(() => {
  const value = computeValue(rows, item, columns, column, rowIndex);
  return value === null ? "" : String(value);
});
const isCurrentOccurrence = computed(
  () => currentOccurrence.value?.rowIndex === rowIndex && currentOccurrence.value?.columnName === column.name,
);
const isOutlier = computed(() => outlierCells.value.has(getItemId(item.id, column.name)));
</script>

<template>
  <div @dblclick.stop="isEditableColumnValue(column) && requestFocus(rowIndex, column.name)">
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
