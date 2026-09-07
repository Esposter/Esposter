<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { useCellStore } from "@/store/resource/sheet/cell";

interface Props {
  column: Column;
  item: Row;
  rowIndex: number;
}

const { column, item, rowIndex } = defineProps<Props>();
const cellStore = useCellStore();
const { checkIsEditingCell } = cellStore;
const editableColumn = computed(() => (checkIsEditableColumnValue(column) ? column : undefined));
</script>

<template>
  <ResourceSheetRowFieldEditable
    v-if="checkIsEditingCell(rowIndex, column.name) && editableColumn"
    :column="editableColumn"
    :item
    :row-index
  />
  <ResourceSheetRowField v-else :column :item :row-index />
</template>
