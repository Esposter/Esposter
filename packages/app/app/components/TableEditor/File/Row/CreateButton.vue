<script setup lang="ts">
const { createRow } = useEditedItemDataSourceOperations();
</script>

<template>
  <v-tooltip text="Add Row">
    <template #activator="{ props: tooltipProps }">
      <v-btn icon="mdi-table-row-plus-after" size="small" tile :="tooltipProps" @click.stop="createRow()" />
    </template>
  </v-tooltip>
</template>
