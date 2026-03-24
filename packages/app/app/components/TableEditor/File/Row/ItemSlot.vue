<script setup lang="ts">
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Row } from "#shared/models/tableEditor/file/Row";
import { isEditableColumn } from "@/services/tableEditor/file/column/isEditableColumn";
import { resolveValue } from "@/services/tableEditor/file/column/resolveValue";
import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/tableEditor/file/constants";
import { getItemId } from "@/services/tableEditor/file/getItemId";
import { useFindReplaceStore } from "@/store/tableEditor/file/findReplace";
import { useOutlierStore } from "@/store/tableEditor/file/outlier";
import { takeOne, toRawDeep } from "@esposter/shared";

interface ItemSlotProps {
  column: DataSource["columns"][number];
  columns: DataSource["columns"];
  item: Row;
  rowIndex: number;
}

const { column, columns, item, rowIndex } = defineProps<ItemSlotProps>();
const findReplaceStore = useFindReplaceStore();
const { currentOccurrenceIndex, findValue, occurrences } = storeToRefs(findReplaceStore);
const outlierStore = useOutlierStore();
const { outlierCells } = storeToRefs(outlierStore);
const updateRow = useUpdateRow();
const editableColumn = computed(() => (isEditableColumn(column) ? column : null));
const currentOccurrence = computed(() => occurrences.value.at(currentOccurrenceIndex.value));
const text = computed(() => {
  const value = resolveValue(item, columns, column);
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
</script>

<template>
  <div
    v-if="isEditing && editableColumn"
    @blur.capture="commitEdit"
    @keydown.enter.stop="!$event.isComposing && commitEdit()"
    @keydown.esc.stop="cancelEdit"
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
