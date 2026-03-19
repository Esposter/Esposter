<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { Row } from "#shared/models/tableEditor/file/Row";

import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/tableEditor/file/constants";
import { getCellId } from "@/services/tableEditor/file/getCellId";
import { useFindReplaceStore } from "@/store/tableEditor/file/findReplace";
import { useOutlierStore } from "@/store/tableEditor/file/outlier";
import { takeOne } from "@esposter/shared";

interface CellSlotProps {
  column: DataSource["columns"][number];
  item: Row;
  rowIndex: number;
}

const { column, item, rowIndex } = defineProps<CellSlotProps>();
const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, occurrences } = storeToRefs(findReplaceStore);
const outlierStore = useOutlierStore();
const { outlierCells } = storeToRefs(outlierStore);
const currentOccurrence = computed(() => occurrences.value.at(currentOccurrenceIndex.value));
const text = computed(() => {
  const value = takeOne(item.data, column.name);
  return value === null ? "" : String(value);
});
const isCurrentOccurrence = computed(
  () => currentOccurrence.value?.rowIndex === rowIndex && currentOccurrence.value?.columnName === column.name,
);
const isOutlier = computed(() => outlierCells.value.has(getCellId(item.id, column.name)));
</script>

<template>
  <TableEditorFileFindReplaceHighlight
    v-if="findValue"
    :class="{ [OUTLIER_HIGHLIGHT_CLASS]: isOutlier }"
    :is-current-occurrence
    :search="findValue"
    :text
  />
  <TableEditorFileRowOutlierHighlight v-else :is-outlier :text />
</template>
