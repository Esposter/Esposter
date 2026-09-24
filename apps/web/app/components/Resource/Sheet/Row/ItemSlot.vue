<script setup lang="ts">
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { toColumnKey } from "@/services/resource/sheet/column/toColumnKey";
import { useCellStore } from "@/store/resource/sheet/cell";
import { useColumnStore } from "@/store/resource/sheet/column";

interface Props {
  columnKey: string;
  item: Row;
  rowIndex: number;
}

const { columnKey, item, rowIndex } = defineProps<Props>();
const columnStore = useColumnStore();
const { displayColumns } = storeToRefs(columnStore);
const cellStore = useCellStore();
const { checkIsEditingCell } = cellStore;
const column = computed(() => displayColumns.value.find(({ name }) => toColumnKey(name) === columnKey));
const editableColumn = computed(() =>
  column.value && checkIsEditableColumnValue(column.value) ? column.value : undefined,
);
</script>

<template>
  <ResourceSheetRowFieldEditable
    v-if="editableColumn && checkIsEditingCell(rowIndex, editableColumn.name)"
    :column="editableColumn"
    :item
    :row-index
  />
  <ResourceSheetRowField v-else-if="column" :column :item :row-index />
</template>
