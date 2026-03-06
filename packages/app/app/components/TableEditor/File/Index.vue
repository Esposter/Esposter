<script setup lang="ts">
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const store = useFileTableEditorStore();
const { dataSource } = storeToRefs(store);
</script>

<template>
  <v-container h-full flex flex-col fluid>
    <TableEditorFileHeader />
    <TableEditorFileDataTable v-if="dataSource" :data-source flex flex-1 flex-col />
    <TableEditorFileEmptyState v-else />
  </v-container>
</template>
