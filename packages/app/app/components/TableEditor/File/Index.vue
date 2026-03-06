<script setup lang="ts">
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const { dataSource } = storeToRefs(useFileTableEditorStore());
</script>

<template>
  <v-container h-full flex flex-col fluid>
    <TableEditorFileDataTable v-if="dataSource" :data-source="dataSource" flex flex-1 flex-col />
    <template v-else>
      <TableEditorFileHeader />
      <TableEditorFileEmptyState />
    </template>
  </v-container>
</template>
