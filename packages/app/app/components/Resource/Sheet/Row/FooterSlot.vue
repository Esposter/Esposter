<script setup lang="ts">
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { buildColumnStatisticsComputeContext } from "@/services/resource/sheet/column/buildColumnStatisticsComputeContext";
import { ColumnStatisticsDefinitionMap } from "@/services/resource/sheet/column/ColumnStatisticsDefinitionMap";
import { toColumnKey } from "@/services/resource/sheet/column/toColumnKey";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useRowStore } from "@/store/resource/sheet/row";
import { takeOne } from "@esposter/shared";

const columnStore = useColumnStore();
const { displayColumns } = storeToRefs(columnStore);
const rowStore = useRowStore();
const { filteredRows, headers } = storeToRefs(rowStore);
const columnKeySummaryMap = computed(() => {
  const result = new Map<string, string>();
  for (const column of displayColumns.value) {
    if (column.type !== ColumnType.Number || !column.footerStatisticsKey) continue;
    const values = filteredRows.value.map((row) => takeOne(row.data, column.name));
    const context = buildColumnStatisticsComputeContext(column.type, values);
    const definition = ColumnStatisticsDefinitionMap[column.footerStatisticsKey];
    const value = definition.compute(context);
    result.set(toColumnKey(column.name), `${definition.title} ${definition.format(value as never, column)}`);
  }
  return result;
});
</script>

<template>
  <tr>
    <td v-for="header of headers" :key="header.key" font-bold>
      {{ columnKeySummaryMap.get(header.key) ?? "" }}
    </td>
  </tr>
</template>
