<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const { previewSnapshotVersionId, stopPreviewingSnapshot } = useVersionHistoryRoute();
</script>

<template>
  <v-list-item :active="!previewSnapshotVersionId" @click="stopPreviewingSnapshot">
    <template #title>
      <div flex gap-2 items-center>
        <span>Current</span>
        <v-chip color="primary" size="x-small" text="Working copy" />
      </div>
    </template>
    <template #subtitle>
      <v-tooltip location="top">
        <template #activator="{ props: tooltipActivatorProps }">
          <NuxtTime :="tooltipActivatorProps" :datetime="resource.updatedAt" relative />
        </template>
        <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="resource.updatedAt" />
      </v-tooltip>
    </template>
  </v-list-item>
</template>
