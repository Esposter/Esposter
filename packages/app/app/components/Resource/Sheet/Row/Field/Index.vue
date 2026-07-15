<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { computeValue } from "@/services/resource/sheet/column/computeValue";
import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/resource/sheet/constants";
import { getItemId } from "@/services/resource/sheet/getItemId";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";
import { useOutlierStore } from "@/store/resource/sheet/outlier";

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
    <ResourceSheetFindReplaceHighlight
      v-if="findValue"
      :class="{ [OUTLIER_HIGHLIGHT_CLASS]: isOutlier }"
      :is-current-occurrence
      :search="findValue"
      :text
    />
    <ResourceSheetRowOutlierHighlight v-else :is-outlier :text />
  </div>
</template>
