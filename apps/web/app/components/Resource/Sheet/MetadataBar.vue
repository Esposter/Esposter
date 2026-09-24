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

<!-- Where the data came from: the file it was imported from, when, and in what shape -->
<template>
  <div flex flex-wrap gap-x-3 gap-y-1 items-center>
    <p ui-title>{{ metadata.name }}</p>
    <p text-muted>Imported <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="metadata.importedAt" /></p>
    <UiChip :meaning="UiIconMeaning.File">{{ metadata.dataSourceType.toUpperCase() }}</UiChip>
    <UiChip :meaning="UiIconMeaning.Storage">{{ displaySize }}</UiChip>
  </div>
</template>
