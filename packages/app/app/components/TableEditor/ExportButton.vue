<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { tableEditor, tableEditorType } = storeToRefs(tableEditorStore);
const exportJsonFile = useExportJsonFile();
</script>

<template>
  <v-tooltip text="Export configuration">
    <template #activator="{ props }">
      <v-btn variant="elevated" :flat="false" :="props" @click="exportJsonFile(tableEditorType, tableEditor)">
        <v-icon icon="mdi-download" />
      </v-btn>
    </template>
  </v-tooltip>
</template>
