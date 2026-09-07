<script setup lang="ts">
import type { Metadata } from "#shared/models/resource/sheet/datasource/Metadata";

import { getFileSize } from "@/services/file/getFileSize";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";

interface Props {
  metadata: Metadata;
}

const { metadata } = defineProps<Props>();
const displaySize = computed(() => getFileSize(metadata.size));
</script>

<template>
  <v-card variant="tonal">
    <v-card-item>
      <v-card-title text-wrap>{{ metadata.name }}</v-card-title>
      <v-card-subtitle>
        Imported <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="metadata.importedAt" />
      </v-card-subtitle>
      <template #append>
        <div flex flex-wrap gap-2>
          <v-chip label size="small" prepend-icon="mdi-database">{{ displaySize }}</v-chip>
          <v-chip label size="small" prepend-icon="mdi-file-outline">
            {{ metadata.dataSourceType.toUpperCase() }}
          </v-chip>
        </div>
      </template>
    </v-card-item>
  </v-card>
</template>
