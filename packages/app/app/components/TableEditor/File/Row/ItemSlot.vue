<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { isEditableColumnValue } from "@/services/tableEditor/file/column/isEditableColumnValue";
import { useCellStore } from "@/store/tableEditor/file/cell";

interface ItemSlotProps {
  column: Column;
  columns: Column[];
  item: Row;
  rowIndex: number;
  rows: Row[];
}

const { column, columns, item, rowIndex, rows } = defineProps<ItemSlotProps>();
const { isEditingCell } = useCellStore();
const editableColumn = computed(() => (isEditableColumnValue(column) ? column : null));
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
