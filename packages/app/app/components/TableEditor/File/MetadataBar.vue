<script setup lang="ts">
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";

interface MetadataBarProps {
  metadata: Metadata;
}

const { metadata } = defineProps<MetadataBarProps>();
const formattedSize = computed(() => {
  if (metadata.size === undefined) return null;
  else if (metadata.size < 1024) return `${metadata.size} B`;
  else if (metadata.size < 1024 * 1024) return `${(metadata.size / 1024).toFixed(1)} KB`;
  else return `${(metadata.size / (1024 * 1024)).toFixed(1)} MB`;
});
const formattedDate = computed(() =>
  metadata.importedAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
);
</script>

<template>
  <v-card variant="tonal">
    <v-card-item>
      <v-card-title class="text-wrap">{{ metadata.name }}</v-card-title>
      <v-card-subtitle>Imported {{ formattedDate }}</v-card-subtitle>
      <template #append>
        <div flex flex-wrap gap-2>
          <v-chip label size="small" prepend-icon="mdi-table-row">{{ metadata.rowCount }} rows</v-chip>
          <v-chip label size="small" prepend-icon="mdi-table-column">{{ metadata.columnCount }} columns</v-chip>
          <v-chip v-if="formattedSize" label size="small" prepend-icon="mdi-database">{{ formattedSize }}</v-chip>
          <v-chip label size="small" prepend-icon="mdi-file-outline">
            {{ metadata.dataSourceType.toUpperCase() }}
          </v-chip>
        </div>
      </template>
    </v-card-item>
  </v-card>
</template>
