<script setup lang="ts">
import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { ChartableColumnTypes } from "@/services/resource/sheet/column/ChartableColumnTypes";
import { ColumnStatisticsHeaders } from "@/services/resource/sheet/column/ColumnStatisticsHeaders";

const isOpen = defineModel<boolean>({ default: false });
const columnStatistics = useColumnStatistics();
const isChartOpen = ref(false);
const selectedStatistics = ref<ColumnStatistics | undefined>();
</script>

<template>
  <StyledDialog v-model="isOpen" :card-props="{ title: 'Column statistics', width: '64rem' }">
    <UiDataTable
      :columns="ColumnStatisticsHeaders"
      :get-item-title="({ column }) => column.name"
      :items="columnStatistics"
      label="Column statistics"
    >
      <template #cell="{ column: tableColumn, item, value }">
        <UiIconButton
          v-if="tableColumn.key === 'chart' && ChartableColumnTypes.has(item.statistics.columnType)"
          :label="`Chart ${item.column.name}`"
          :meaning="UiIconMeaning.Chart"
          :variant="UiButtonVariant.Quiet"
          @click="
            () => {
              selectedStatistics = item.statistics;
              isChartOpen = true;
            }
          "
        />
        <template v-else>{{ value }}</template>
      </template>
    </UiDataTable>
  </StyledDialog>
  <ResourceSheetColumnChartDialog v-model="isChartOpen" :column-statistics="selectedStatistics" />
</template>
