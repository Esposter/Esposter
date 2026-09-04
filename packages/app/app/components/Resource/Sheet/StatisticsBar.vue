<script setup lang="ts">
import type { DataSourceStatistics } from "@/models/resource/sheet/dataSource/DataSourceStatistics";

import { getFileSize } from "@/services/file/getFileSize";

interface Props {
  filteredRowCount: number;
  statistics: DataSourceStatistics;
}

const { filteredRowCount, statistics } = defineProps<Props>();
const isFiltered = computed(() => filteredRowCount !== statistics.rowCount);
const displaySize = computed(() => getFileSize(statistics.size));
</script>

<template>
  <div flex flex-wrap gap-2>
    <v-chip label size="small" :prepend-icon="isFiltered ? 'mdi-filter' : 'mdi-table-row'">
      <template v-if="isFiltered">{{ filteredRowCount }} / {{ statistics.rowCount }} rows</template>
      <template v-else>{{ statistics.rowCount }} rows</template>
    </v-chip>
    <v-chip label size="small" prepend-icon="mdi-table-column">{{ statistics.columnCount }} columns</v-chip>
    <v-chip label size="small" prepend-icon="mdi-database">{{ displaySize }}</v-chip>
  </div>
</template>
