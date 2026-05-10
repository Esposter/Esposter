<script setup lang="ts">
const isOpen = ref(false);
</script>

<template>
  <v-tooltip text="Column Statistics">
    <template #activator="{ props: tooltipProps }">
      <v-btn icon="mdi-sigma" size="small" tile m-0 :="tooltipProps" @click.stop="isOpen = true" />
    </template>
  </v-tooltip>
  <TableEditorFileColumnStatisticsDialog v-model="isOpen" />
</template>
