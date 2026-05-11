<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";

interface ColumnItemSlotProps {
  column: Column;
}

const { column } = defineProps<ColumnItemSlotProps>();
</script>

<template>
  <div flex gap-1 items-center>
    {{ column.name }}
    <v-tooltip v-if="column.description" :text="column.description">
      <template #activator="{ props }">
        <v-icon icon="mdi-information-outline" size="small" :="props" />
      </template>
    </v-tooltip>
  </div>
</template>
