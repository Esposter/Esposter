<script setup lang="ts">
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Row } from "#shared/models/tableEditor/file/Row";
import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/tableEditor/file/constants";
import { getItemId } from "@/services/tableEditor/file/getItemId";
import { useFindReplaceStore } from "@/store/tableEditor/file/findReplace";
import { useOutlierStore } from "@/store/tableEditor/file/outlier";
import { takeOne, toRawDeep } from "@esposter/shared";

interface ItemSlotProps {
  column: DataSource["columns"][number];
  item: Row;
  rowIndex: number;
}

const { column, item, rowIndex } = defineProps<ItemSlotProps>();
const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, occurrences } = storeToRefs(findReplaceStore);
const outlierStore = useOutlierStore();
const { outlierCells } = storeToRefs(outlierStore);
const updateRow = useUpdateRow();
const currentOccurrence = computed(() => occurrences.value.at(currentOccurrenceIndex.value));
const text = computed(() => {
  const value = takeOne(item.data, column.name);
  return value === null ? "" : String(value);
});
const isCurrentOccurrence = computed(
  () => currentOccurrence.value?.rowIndex === rowIndex && currentOccurrence.value?.columnName === column.name,
);
const isOutlier = computed(() => outlierCells.value.has(getItemId(item.id, column.name)));
const isEditing = ref(false);
const localValue = ref<ColumnValue>(null);

const startEditing = () => {
  localValue.value = takeOne(item.data, column.name) ?? null;
  isEditing.value = true;
};

const commitEdit = () => {
  if (!isEditing.value) return;
  isEditing.value = false;
  if (localValue.value === (takeOne(item.data, column.name) ?? null)) return;
  updateRow(Object.assign(structuredClone(toRawDeep(item)), { data: { ...item.data, [column.name]: localValue.value } }));
};

const cancelEdit = () => {
  isEditing.value = false;
};
</script>

<template>
  <div
    v-if="isEditing"
    @blur.capture="commitEdit"
    @keydown.enter.stop="commitEdit"
    @keydown.esc.stop="cancelEdit"
  >
    <TableEditorFileRowFieldInput v-model="localValue" :column autofocus hide-details inline />
  </div>
  <div
    v-else
    @dblclick.stop="startEditing"
  >
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
