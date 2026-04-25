<script setup lang="ts">
import type { DataSourceStatistics } from "#shared/models/tableEditor/file/datasource/DataSourceStatistics";

import { formatSize } from "@/util/formatSize";

interface StatisticsBarProps {
  filteredRowCount?: number;
  statistics: DataSourceStatistics;
}

const { filteredRowCount, statistics } = defineProps<StatisticsBarProps>();
const isFiltered = computed(() => filteredRowCount !== undefined && filteredRowCount !== statistics.rowCount);
</script>

<template>
  <div flex flex-wrap gap-2>
    <v-chip label size="small" :prepend-icon="isFiltered ? 'mdi-filter' : 'mdi-table-row'">
      <template v-if="isFiltered">{{ filteredRowCount }} / {{ statistics.rowCount }} rows</template>
      <template v-else>{{ statistics.rowCount }} rows</template>
    </v-chip>
    <v-chip label size="small" prepend-icon="mdi-table-column">{{ statistics.columnCount }} columns</v-chip>
    <v-chip label size="small" prepend-icon="mdi-database">{{ formatSize(statistics.size) }}</v-chip>
  </div>
</template>
