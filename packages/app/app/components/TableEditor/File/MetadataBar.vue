<script setup lang="ts">
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";

import { dayjs } from "#shared/services/dayjs";
import { formatSize } from "@/util/formatSize";

interface MetadataBarProps {
  metadata: Metadata;
}

const { metadata } = defineProps<MetadataBarProps>();
const formattedDate = computed(() => dayjs(metadata.importedAt).format("MMM D, YYYY h:mm A"));
</script>

<template>
  <v-card variant="tonal">
    <v-card-item>
      <v-card-title class="text-wrap">{{ metadata.name }}</v-card-title>
      <v-card-subtitle>Imported {{ formattedDate }}</v-card-subtitle>
      <template #append>
        <div flex flex-wrap gap-2>
          <v-chip label size="small" prepend-icon="mdi-database">{{ formatSize(metadata.size) }}</v-chip>
          <v-chip label size="small" prepend-icon="mdi-file-outline">
            {{ metadata.dataSourceType.toUpperCase() }}
          </v-chip>
        </div>
      </template>
    </v-card-item>
  </v-card>
</template>
