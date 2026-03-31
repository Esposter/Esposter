<script setup lang="ts">
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { buildColumnStatComputeContext } from "@/services/tableEditor/file/column/buildColumnStatComputeContext";
import { ColumnStatDefinitionMap } from "@/services/tableEditor/file/column/ColumnStatDefinitionMap";
import { toColumnKey } from "@/services/tableEditor/file/column/toColumnKey";
import { useColumnStore } from "@/store/tableEditor/file/column";
import { useRowStore } from "@/store/tableEditor/file/row";
import { takeOne } from "@esposter/shared";

const columnStore = useColumnStore();
const { displayColumns } = storeToRefs(columnStore);
const rowStore = useRowStore();
const { filteredRows, headers } = storeToRefs(rowStore);
const columnSummaries = computed(() => {
  const result = new Map<string, string>();
  for (const column of displayColumns.value) {
    if (column.type !== ColumnType.Number) continue;
    const values = filteredRows.value.map((row) => takeOne(row.data, column.name));
    const context = buildColumnStatComputeContext(column, values);
    const sumValue = ColumnStatDefinitionMap.sum.compute(context);
    result.set(toColumnKey(column.name), `Σ ${ColumnStatDefinitionMap.sum.format(sumValue)}`);
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
