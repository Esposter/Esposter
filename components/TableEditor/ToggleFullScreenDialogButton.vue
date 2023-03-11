<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { isFullScreenDialog } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-tooltip :text="isFullScreenDialog ? 'Exit full screen mode' : 'Enter full screen mode'">
    <template #activator="{ props }">
      <v-btn
        :icon="isFullScreenDialog ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
        :="props"
        @click="isFullScreenDialog = !isFullScreenDialog"
      />
    </template>
  </v-tooltip>
</template>
