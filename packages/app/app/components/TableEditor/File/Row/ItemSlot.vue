<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/tableEditor/file/column/checkIsEditableColumnValue";
import { useCellStore } from "@/store/tableEditor/file/cell";

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
  <TableEditorFileRowFieldEditable
    v-if="isEditingCell(rowIndex, column.name) && editableColumn"
    :column="editableColumn"
    :columns
    :item
    :row-index
    :rows
  />
  <TableEditorFileRowField v-else :column :columns :item :row-index :rows />
</template>
