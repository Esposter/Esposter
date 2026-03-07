<script setup lang="ts">
import type { Metadata } from "#shared/models/tableEditor/file/Metadata";

const { metadata } = defineProps<{ metadata: Metadata }>();
const formattedSize = computed(() => {
  if (metadata.size === undefined) return null;
  else if (metadata.size < 1024) return `${metadata.size} B`;
  else if (metadata.size < 1024 * 1024) return `${(metadata.size / 1024).toFixed(1)} KB`;
  else return `${(metadata.size / (1024 * 1024)).toFixed(1)} MB`;
});
</script>

<template>
  <v-toolbar density="compact" flat>
    <v-toolbar-title>{{ metadata.name }}</v-toolbar-title>
    <v-spacer />
    <v-chip mr-2>{{ metadata.rowCount }} rows</v-chip>
    <v-chip mr-2>{{ metadata.columnCount }} columns</v-chip>
    <v-chip v-if="formattedSize" mr-2>{{ formattedSize }}</v-chip>
    <v-chip>{{ metadata.dataSourceType }}</v-chip>
  </v-toolbar>
</template>
