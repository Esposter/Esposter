<script setup lang="ts">
import type { Column } from "#shared/models/resource/file/column/Column";
import type { Row } from "#shared/models/resource/file/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/resource/file/column/checkIsEditableColumnValue";
import { useCellStore } from "@/store/resource/file/cell";

interface ItemSlotProps {
  column: Column;
  columns: Column[];
  item: Row;
  rowIndex: number;
  rows: Row[];
}

const { column, columns, item, rowIndex, rows } = defineProps<ItemSlotProps>();
const cellStore = useCellStore();
const { isEditingCell } = cellStore;
const editableColumn = computed(() => (checkIsEditableColumnValue(column) ? column : null));
</script>

<template>
  <ResourceFileRowFieldEditable
    v-if="isEditingCell(rowIndex, column.name) && editableColumn"
    :column="editableColumn"
    :columns
    :item
    :row-index
    :rows
  />
  <ResourceFileRowField v-else :column :columns :item :row-index :rows />
</template>
