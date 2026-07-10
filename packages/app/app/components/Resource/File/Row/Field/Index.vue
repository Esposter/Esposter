<script setup lang="ts">
import type { Column } from "#shared/models/resource/file/column/Column";
import type { Row } from "#shared/models/resource/file/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/resource/file/column/checkIsEditableColumnValue";
import { computeValue } from "@/services/resource/file/column/computeValue";
import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/resource/file/constants";
import { getItemId } from "@/services/resource/file/getItemId";
import { useCellStore } from "@/store/resource/file/cell";
import { useFindReplaceStore } from "@/store/resource/file/findReplace";
import { useOutlierStore } from "@/store/resource/file/outlier";

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
const cellStore = useCellStore();
const { requestFocus } = cellStore;
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
  <div @dblclick.stop="checkIsEditableColumnValue(column) && requestFocus(rowIndex, column.name)">
    <ResourceFileFindReplaceHighlight
      v-if="findValue"
      :class="{ [OUTLIER_HIGHLIGHT_CLASS]: isOutlier }"
      :is-current-occurrence
      :search="findValue"
      :text
    />
    <ResourceFileRowOutlierHighlight v-else :is-outlier :text />
  </div>
</template>
