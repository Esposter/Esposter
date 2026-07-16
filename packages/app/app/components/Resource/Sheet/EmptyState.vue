<script setup lang="ts">
import { useSheetStore } from "@/store/resource/sheet";

const sheetStore = useSheetStore();
const { settings } = storeToRefs(sheetStore);
</script>

<template>
  <v-empty-state
    icon="mdi-file-table-outline"
    headline="No file loaded"
    :text="`Import a ${settings.type.toUpperCase()} file to get started`"
  />
</template>
