<script setup lang="ts">
import type { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";

interface EmptyStateProps {
  type: DataSourceType;
}

const { type } = defineProps<EmptyStateProps>();
</script>

<template>
  <v-empty-state
    icon="mdi-file-table-outline"
    headline="No file loaded"
    :text="`Import a ${type.toUpperCase()} file to get started`"
  />
</template>
