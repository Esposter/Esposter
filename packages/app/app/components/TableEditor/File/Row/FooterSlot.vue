<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { filterDataSourceRows } from "@/services/tableEditor/file/dataSource/filterDataSourceRows";
import { useFilterStore } from "@/store/tableEditor/file/filter";
import { takeOne } from "@esposter/shared";

interface FooterSlotProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<FooterSlotProps>();
const filterStore = useFilterStore();
const { columnFilters } = storeToRefs(filterStore);
const displayColumns = computed(() => dataSource.columns.filter((column) => !column.hidden));
const filteredRows = computed(() => filterDataSourceRows(dataSource, columnFilters.value).rows);
const columnSummaries = computed(() => {
  const result = new Map<string, string>();
  for (const column of displayColumns.value) {
    if (column.type !== ColumnType.Number) continue;
    const sum = filteredRows.value.reduce((acc, row) => {
      const value = takeOne(row.data, column.name);
      return typeof value === "number" ? acc + value : acc;
    }, 0);
    result.set(column.name, `Σ ${Math.round(sum * 100) / 100}`);
  }
  return result;
});
</script>

<template>
  <tr>
    <td />
    <td />
    <td v-for="column of displayColumns" :key="column.id" font-weight-bold>
      {{ columnSummaries.get(column.name) ?? "" }}
    </td>
    <td />
  </tr>
</template>
