<script setup lang="ts">
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { computeColumnChartData } from "@/services/tableEditor/file/column/computeColumnChartData";
import VueApexCharts from "vue3-apexcharts";

interface ChartDialogProps {
  columnStats: ColumnStats | null;
}

const isOpen = defineModel<boolean>();
const { columnStats } = defineProps<ChartDialogProps>();
const chartData = computed(() => (columnStats ? computeColumnChartData(columnStats) : null));
</script>

<template>
  <v-dialog v-model="isOpen" max-width="600">
    <v-card>
      <v-card-title>{{ columnStats?.columnName }} — Chart</v-card-title>
      <v-card-text>
        <VueApexCharts v-if="chartData" :options="chartData.options" :series="chartData.series" :type="chartData.type" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="isOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
