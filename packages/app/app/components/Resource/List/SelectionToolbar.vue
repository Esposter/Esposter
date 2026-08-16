<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

interface ResourceListSelectionToolbarProps {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<ResourceListSelectionToolbarProps>();
const emit = defineEmits<{ clear: []; delete: [resources: Resource[]] }>();
</script>

<template>
  <div px-4 py-2 b-0 b-b-1 b-border b-solid flex flex-wrap gap-2 items-center>
    <span op-medium-emphasis>{{ selectedResources.length }} selected</span>
    <ResourceListSelectionDeleteButton :selected-resources @delete="emit('delete', $event)" />
    <ResourceListSelectionExportButton :selected-resources />
    <ResourceListSelectionCaptureBlueprintButton :selected-resources />
    <v-spacer />
    <v-btn size="small" variant="text" @click="emit('clear')">Clear</v-btn>
  </div>
</template>
