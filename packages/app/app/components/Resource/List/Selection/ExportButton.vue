<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

interface Props {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<Props>();
const { exportResourcesCsv } = useExportResourcesCsv();
</script>

<template>
  <v-btn prepend-icon="mdi-file-export-outline" variant="text" @click="exportResourcesCsv(selectedResources)">
    Export CSV
  </v-btn>
</template>
