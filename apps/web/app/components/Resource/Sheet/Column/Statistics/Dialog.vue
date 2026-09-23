<script setup lang="ts">
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnStatisticsRow } from "@/models/resource/sheet/column/ColumnStatisticsRow";

import { ChartableColumnTypes } from "@/services/resource/sheet/column/ChartableColumnTypes";
import { ColumnStatisticsDefinitions } from "@/services/resource/sheet/column/ColumnStatisticsDefinitionMap";
import { ColumnStatisticsHeaders } from "@/services/resource/sheet/column/ColumnStatisticsHeaders";

const isOpen = defineModel<boolean>();
const columnStatistics = useColumnStatistics();
const isChartOpen = ref(false);
const selectedStatistics = ref<ColumnStatistics | undefined>();
const itemValue = ({ column }: ColumnStatisticsRow) => column.name;
</script>

<template>
  <ResourceSheetDialog v-model="isOpen" title="Column Statistics">
    <v-data-table density="compact" :headers="ColumnStatisticsHeaders" :item-value :items="columnStatistics">
      <template #[`item.chart`]="{ item }">
        <v-tooltip v-if="ChartableColumnTypes.has(item.statistics.columnType)" text="View Chart">
          <template #activator="{ props }">
            <v-btn
              density="compact"
              icon="i-mdi:chart-bar"
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
