<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/resource/sheet/constants";
import { getItemId } from "@/services/resource/sheet/getItemId";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";
import { useOutlierStore } from "@/store/resource/sheet/outlier";
import { useRowStore } from "@/store/resource/sheet/row";

interface Props {
  column: Column;
  item: Row;
  rowIndex: number;
}

const { column, item, rowIndex } = defineProps<Props>();
const rowStore = useRowStore();
const { getCellText } = rowStore;
const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, occurrences } = storeToRefs(findReplaceStore);
const outlierStore = useOutlierStore();
const { outlierCells } = storeToRefs(outlierStore);
const cellStore = useCellStore();
const { requestFocus } = cellStore;
const currentOccurrence = computed(() => occurrences.value.at(currentOccurrenceIndex.value));
const text = computed(() => getCellText(item, column));
const isOutlier = computed(() => outlierCells.value.has(getItemId(item.id, column.name)));
</script>

<template>
  <div @dblclick.stop="checkIsEditableColumnValue(column) && requestFocus(rowIndex, column.name)">
    <ResourceSheetFindReplaceHighlight
      v-if="findValue"
      :class="{ [OUTLIER_HIGHLIGHT_CLASS]: isOutlier }"
      :is-current-occurrence="currentOccurrence?.rowIndex === rowIndex && currentOccurrence?.columnName === column.name"
      :search="findValue"
      :text
    />
    <ResourceSheetRowOutlierHighlight v-else :is-outlier :text />
  </div>
</template>
