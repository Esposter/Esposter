<script setup lang="ts">
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

const tableEditorStore = useTableEditorStore<DataSourceItem>();
const { editedItem } = storeToRefs(tableEditorStore);
const fileHistoryStore = useFileHistoryStore();
const { undo } = fileHistoryStore;
const { isUndoable, undoDescription } = storeToRefs(fileHistoryStore);
const tooltipHtml = useHistoryTooltipHtml(undoDescription, "Undo", "Ctrl+Z");

onKeyStroke(["z", "Z"], (event) => {
  if ((!event.ctrlKey && !event.metaKey) || event.shiftKey) return;
  event.preventDefault();
  undo(editedItem.value);
});
</script>

<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn :disabled="!isUndoable" icon="mdi-undo" variant="text" :="props" @click="undo(editedItem)" />
    </template>
    <div v-html="tooltipHtml" />
  </v-tooltip>
</template>
