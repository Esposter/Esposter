<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { Row } from "#shared/models/tableEditor/file/Row";

import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/tableEditor/file/constants";
import { getCellId } from "@/services/tableEditor/file/getCellId";
import { takeOne } from "@esposter/shared";

interface CellSlotProps {
  column: DataSource["columns"][number];
  item: Row;
  itemsPerPage: number;
  rowIndex: number;
}

const { column, item, itemsPerPage, rowIndex } = defineProps<CellSlotProps>();
const page = defineModel<number>("page", { required: true });
const { currentOccurrenceIndex, findValue, occurrences } = useFindReplaceState();
const { outlierCells } = useOutlierState();
const currentOccurrence = computed(() => occurrences.value.at(currentOccurrenceIndex.value));
const cellText = computed(() => {
  const value = takeOne(item.data, column.name);
  return value === null ? "" : String(value);
});
const isOutlier = computed(() => outlierCells.value.has(getCellId(item.id, column.name)));
const isCurrent = computed(
  () => currentOccurrence.value?.rowIndex === rowIndex && currentOccurrence.value?.columnName === column.name,
);

watchImmediate(isCurrent, async (newIsCurrent) => {
  if (!newIsCurrent) return;
  const targetPage = Math.floor(rowIndex / itemsPerPage) + 1;
  if (page.value !== targetPage) page.value = targetPage;
  await nextTick();
  document.querySelector("[data-find-replace-current]")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
</script>

<template>
  <TableEditorFileFindReplaceHighlight
    v-if="findValue"
    :class="{ [OUTLIER_HIGHLIGHT_CLASS]: isOutlier }"
    :is-current="isCurrent"
    :search="findValue"
    :text="cellText"
  />
  <TableEditorFileRowOutlierHighlight v-else :is-outlier="isOutlier" :text="cellText" />
</template>
