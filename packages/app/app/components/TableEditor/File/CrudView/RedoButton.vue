<script setup lang="ts">
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

const tableEditorStore = useTableEditorStore<DataSourceItem>();
const { editedItem } = storeToRefs(tableEditorStore);
const fileHistoryStore = useFileHistoryStore();
const { redo } = fileHistoryStore;
const { isRedoable, redoDescription } = storeToRefs(fileHistoryStore);
const tooltipHtml = useHistoryTooltipHtml(redoDescription, "Redo", "Ctrl+Shift+Z");

onKeyStroke(["z", "Z"], (event) => {
  if ((!event.ctrlKey && !event.metaKey) || !event.shiftKey) return;
  event.preventDefault();
  redo(editedItem.value);
});

onKeyStroke(["y", "Y"], (event) => {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  redo(editedItem.value);
});
</script>

<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn :disabled="!isRedoable" icon="mdi-redo" variant="text" :="props" @click="redo(editedItem)" />
    </template>
    <div v-html="tooltipHtml" />
  </v-tooltip>
</template>
