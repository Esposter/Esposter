<script setup lang="ts">
import type { DataSourceStats } from "#shared/models/tableEditor/file/DataSourceStats";

import { formatSize } from "@/util/formatSize";

interface StatsBarProps {
  stats: DataSourceStats;
}

const { stats } = defineProps<StatsBarProps>();
</script>

<template>
  <div flex flex-wrap gap-2>
    <v-chip label size="small" prepend-icon="mdi-table-row">{{ stats.rowCount }} rows</v-chip>
    <v-chip label size="small" prepend-icon="mdi-table-column">{{ stats.columnCount }} columns</v-chip>
    <v-chip label size="small" prepend-icon="mdi-database">{{ formatSize(stats.size) }}</v-chip>
  </div>
</template>
