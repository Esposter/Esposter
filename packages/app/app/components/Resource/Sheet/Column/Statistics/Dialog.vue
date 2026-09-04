<script setup lang="ts">
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { ColumnStatisticsDefinitions } from "@/services/resource/sheet/column/ColumnStatisticsDefinitionMap";
import { ChartableColumnTypes } from "@/services/resource/sheet/column/computeColumnChartData";

const isOpen = defineModel<boolean>();
const columnStatistics = useColumnStatistics();
type ColumnStatisticsRow = (typeof columnStatistics.value)[number];
const isChartOpen = ref(false);
const selectedStatistics = ref<ColumnStatistics | undefined>();
// A row is the column paired with its statistics, so every column reads through an accessor rather than through
// A key naming a top-level field
const HEADERS = [
  { key: "chart", sortable: false, title: "" },
  { key: "columnName", sortable: false, title: "Column", value: ({ column }: ColumnStatisticsRow) => column.name },
  {
    key: "columnType",
    sortable: false,
    title: "Type",
    value: ({ statistics }: ColumnStatisticsRow) => statistics.columnType,
  },
  ...ColumnStatisticsDefinitions.map(({ key, sortable, title }) => ({
    key,
    sortable,
    title,
    value: ({ statistics }: ColumnStatisticsRow) => statistics[key],
  })),
];
const itemValue = ({ column }: ColumnStatisticsRow) => column.name;
</script>

<template>
  <ResourceSheetDialog v-model="isOpen" title="Column Statistics">
    <v-data-table density="compact" :headers="HEADERS" :item-value :items="columnStatistics">
      <template #[`item.chart`]="{ item }">
        <v-tooltip v-if="ChartableColumnTypes.has(item.statistics.columnType)" text="View Chart">
          <template #activator="{ props }">
            <v-btn
              density="compact"
              icon="mdi-chart-bar"
              variant="text"
              :="props"
              @click.stop="
                () => {
                  selectedStatistics = item.statistics;
                  isChartOpen = true;
                }
              "
            />
          </template>
        </v-tooltip>
      </template>
      <template v-for="{ key, format } of ColumnStatisticsDefinitions" :key #[`item.${key}`]="{ item }">
        {{ format(item.statistics[key] as never, item.column) }}
      </template>
    </v-data-table>
  </ResourceSheetDialog>
  <ResourceSheetColumnChartDialog v-model="isChartOpen" :column-statistics="selectedStatistics" />
</template>
