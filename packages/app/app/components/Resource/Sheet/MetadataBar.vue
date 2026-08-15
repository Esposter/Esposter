<script setup lang="ts">
import type { Metadata } from "#shared/models/resource/sheet/datasource/Metadata";

import { dayjs } from "#shared/services/dayjs";
import { getFileSize } from "@/services/file/getFileSize";

interface MetadataBarProps {
  metadata: Metadata;
}

const { metadata } = defineProps<MetadataBarProps>();
</script>

<template>
  <v-card variant="tonal">
    <v-card-item>
      <v-card-title text-wrap>{{ metadata.name }}</v-card-title>
      <v-card-subtitle>Imported {{ dayjs(metadata.importedAt).format("MMM D, YYYY h:mm A") }}</v-card-subtitle>
      <template #append>
        <div flex flex-wrap gap-2>
          <v-chip label size="small" prepend-icon="mdi-database">{{ getFileSize(metadata.size) }}</v-chip>
          <v-chip label size="small" prepend-icon="mdi-file-outline">
            {{ metadata.dataSourceType.toUpperCase() }}
          </v-chip>
        </div>
      </template>
    </v-card-item>
  </v-card>
</template>
