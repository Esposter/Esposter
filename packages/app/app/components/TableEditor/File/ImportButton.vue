<script setup lang="ts">
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const fileInputRef = ref<HTMLInputElement | null>(null);
const { importFile } = useFileTableEditorStore();
</script>

<template>
  <input ref="fileInputRef" type="file" accept=".csv" hidden @change="(e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) importFile(file); }" />
  <v-btn prepend-icon="mdi-upload" @click="fileInputRef?.click()">Import file</v-btn>
</template>
