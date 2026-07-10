<script setup lang="ts">
import { useFileStore } from "@/store/resource/file";

const fileStore = useFileStore();
const { settings } = storeToRefs(fileStore);
</script>

<template>
  <v-empty-state
    icon="mdi-file-table-outline"
    headline="No file loaded"
    :text="`Import a ${settings.type.toUpperCase()} file to get started`"
  />
</template>
