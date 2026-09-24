<script setup lang="ts">
import type { Metadata } from "#shared/models/resource/sheet/datasource/Metadata";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getFileSize } from "@/services/file/getFileSize";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";

interface Props {
  metadata: Metadata;
}

const { metadata } = defineProps<Props>();
const displaySize = computed(() => getFileSize(metadata.size));
</script>

<!-- Where the data came from, on one line: the file it was imported from, then its shape and when as one muted
  reading, as a spreadsheet's file line reads, rather than a chip per fact -->
<template>
  <div flex gap-3 items-baseline>
    <p min-w-0 truncate ui-title>{{ metadata.name }}</p>
    <p text-sm text-muted flex shrink-0 gap-1 items-center>
      <UiIcon :meaning="UiIconMeaning.File" />
      {{ metadata.dataSourceType.toUpperCase() }} · {{ displaySize }} · Imported
      <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="metadata.importedAt" />
    </p>
  </div>
</template>
