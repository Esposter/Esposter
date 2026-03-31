<script setup lang="ts">
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { computeValue } from "@/services/tableEditor/file/column/computeValue";
import { toColumnKey } from "@/services/tableEditor/file/column/toColumnKey";
import { useColumnStore } from "@/store/tableEditor/file/column";
import { useRowStore } from "@/store/tableEditor/file/row";

const columnStore = useColumnStore();
const { columns, displayColumns } = storeToRefs(columnStore);
const rowStore = useRowStore();
const { filteredRows, headers } = storeToRefs(rowStore);
const columnSummaries = computed(() => {
  const result = new Map<string, string>();
  for (const column of displayColumns.value) {
    if (column.type !== ColumnType.Number) continue;
    const sum = filteredRows.value.reduce((acc, row) => {
      const value = computeValue(filteredRows.value, row, columns.value, column);
      return typeof value === "number" ? acc + value : acc;
    }, 0);
    result.set(toColumnKey(column.name), `Σ ${Math.round(sum * 100) / 100}`);
  }
  return result;
});
</script>

<template>
  <tr>
    <td v-for="header of headers" :key="header.key" font-weight-bold>
      {{ columnSummaries.get(header.key) ?? "" }}
    </td>
  </tr>
</template>
