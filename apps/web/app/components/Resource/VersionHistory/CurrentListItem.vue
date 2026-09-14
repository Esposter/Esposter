<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

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
      <ResourceVersionHistoryTime :datetime="resource.updatedAt" />
    </template>
  </v-list-item>
</template>
