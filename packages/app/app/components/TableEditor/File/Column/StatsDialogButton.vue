<script setup lang="ts">
const isOpen = ref(false);
</script>

<template>
  <v-tooltip text="Column Statistics">
    <template #activator="{ props: tooltipProps }">
      <v-btn m-0 icon="mdi-sigma" size="small" tile :="tooltipProps" @click.stop="isOpen = true" />
    </template>
  </v-tooltip>
  <TableEditorFileColumnStatsDialog v-model="isOpen" />
</template>
