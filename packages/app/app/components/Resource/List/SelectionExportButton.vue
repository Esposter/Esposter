<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

interface ResourceListSelectionExportButtonProps {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<ResourceListSelectionExportButtonProps>();
const { exportResourcesCsv } = useExportResourcesCsv();
</script>

<template>
  <v-btn prepend-icon="mdi-file-export-outline" variant="text" @click="exportResourcesCsv(selectedResources)">
    Export CSV
  </v-btn>
</template>
