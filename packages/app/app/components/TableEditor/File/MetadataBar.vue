<script setup lang="ts">
import type { DataSourceStats } from "#shared/models/tableEditor/file/DataSourceStats";
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";

import { dayjs } from "#shared/services/dayjs";

interface MetadataBarProps {
  metadata: Metadata;
  stats: DataSourceStats;
}

const { metadata, stats } = defineProps<MetadataBarProps>();
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
const formattedDate = computed(() => dayjs(metadata.importedAt).format("MMM D, YYYY h:mm A"));
</script>

<template>
  <v-card variant="tonal">
    <v-card-item>
      <v-card-title class="text-wrap">{{ metadata.name }}</v-card-title>
      <v-card-subtitle>Imported {{ formattedDate }}</v-card-subtitle>
      <template #append>
        <div flex flex-wrap gap-2>
          <v-chip label size="small" prepend-icon="mdi-table-row">{{ stats.rowCount }} rows</v-chip>
          <v-chip label size="small" prepend-icon="mdi-table-column">{{ stats.columnCount }} columns</v-chip>
          <v-chip label size="small" prepend-icon="mdi-database">{{ formatSize(stats.size) }}</v-chip>
          <v-chip label size="small" prepend-icon="mdi-file-outline">
            {{ formatSize(metadata.originalSize) }} ({{ metadata.dataSourceType.toUpperCase() }})
          </v-chip>
        </div>
      </template>
    </v-card-item>
  </v-card>
</template>
