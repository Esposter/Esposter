<script setup lang="ts">
import type { DataSourceStats } from "#shared/models/tableEditor/file/datasource/DataSourceStats";

import { formatSize } from "@/util/formatSize";

interface StatsBarProps {
  filteredRowCount?: number;
  stats: DataSourceStats;
}

const { filteredRowCount, stats } = defineProps<StatsBarProps>();
const isFiltered = computed(() => filteredRowCount !== undefined && filteredRowCount !== stats.rowCount);
</script>

<template>
  <div flex flex-wrap gap-2>
    <v-chip label size="small" :prepend-icon="isFiltered ? 'mdi-filter' : 'mdi-table-row'">
      <template v-if="isFiltered">{{ filteredRowCount }} / {{ stats.rowCount }} rows</template>
      <template v-else>{{ stats.rowCount }} rows</template>
    </v-chip>
    <v-chip label size="small" prepend-icon="mdi-table-column">{{ stats.columnCount }} columns</v-chip>
    <v-chip label size="small" prepend-icon="mdi-database">{{ formatSize(stats.size) }}</v-chip>
  </div>
</template>
