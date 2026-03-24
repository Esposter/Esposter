<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

interface ColumnItemSlotProps {
  column: DataSource["columns"][number];
}

const { column } = defineProps<ColumnItemSlotProps>();
</script>

<template>
  <div flex items-center gap-1>
    <span>{{ column.name }}</span>
    <v-tooltip v-if="column.description" :text="column.description">
      <template #activator="{ props }">
        <v-icon icon="mdi-information-outline" size="small" :="props" />
      </template>
    </v-tooltip>
  </div>
</template>
