<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { AxisVisualPropsData } from "@/models/dashboard/AxisVisualPropsData";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { NUMBER_FORMATTER } from "#shared/services/intl/constants";
import { DASHBOARD_TABLE_CATEGORY_KEY } from "@/services/dashboard/constants";
import { takeOne } from "@esposter/shared";

interface Props {
  data: AxisVisualPropsData;
  visual: Visual;
}

interface TableRow {
  category: string;
  id: string;
  values: number[];
}

const { data, visual } = defineProps<Props>();
// The categories and series are the chart's own, so a table over a binding reads the same numbers the chart draws
const categories = computed(() => (data.options?.xaxis?.categories ?? []).map(String));
const querySeries = computed(() => visual.dataset?.query.series ?? []);
const rows = computed<TableRow[]>(() =>
  categories.value.map((category, index) => ({
    category,
    id: category,
    values: data.series.map((series) => Number(takeOne(series.data, index))),
  })),
);
// A series' column and its totals cell are the same key, so the total lands under the column it sums
const getSeriesColumnKey = (index: number) => `series${index}`;
const columns = computed<UiDataTableColumn<TableRow, string>[]>(() => [
  {
    compare: (first, second) => first.category.localeCompare(second.category),
    getValue: ({ category }) => category,
    key: DASHBOARD_TABLE_CATEGORY_KEY,
    title: visual.dataset ? visual.dataset.query.xColumn : "Category",
  },
  ...data.series.map((series, index) => ({
    compare: (first: TableRow, second: TableRow) => takeOne(first.values, index) - takeOne(second.values, index),
    getValue: ({ values }: TableRow) => NUMBER_FORMATTER.format(takeOne(values, index)),
    key: getSeriesColumnKey(index),
    title: `${series.name}`,
  })),
]);
// A total of counts or sums is a count or a sum of the rows, but a total of averages or extremes is neither an
// Average nor an extreme of them, so those columns leave the totals row blank
const columnKeyTotalMap = computed(
  () =>
    new Map<string, string>([
      [DASHBOARD_TABLE_CATEGORY_KEY, "Total"],
      ...data.series.flatMap((_series, index): [string, string][] => {
        const aggregation = querySeries.value[index]?.aggregation;
        if (aggregation !== DatasetAggregationType.Count && aggregation !== DatasetAggregationType.Sum) return [];

        const total = rows.value.reduce((sum, row) => sum + takeOne(row.values, index), 0);
        return [[getSeriesColumnKey(index), NUMBER_FORMATTER.format(total)]];
      }),
    ]),
);
</script>

<template>
  <UiDataTable
    p-3
    size-full
    min-h-0
    of-y-auto
    :columns
    :get-item-title="({ category }) => category"
    :items="rows"
    label="Visual table"
  >
    <template #foot="{ column }">{{ columnKeyTotalMap.get(column.key) ?? "" }}</template>
  </UiDataTable>
</template>
