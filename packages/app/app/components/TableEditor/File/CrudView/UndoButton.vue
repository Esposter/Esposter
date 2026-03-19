<script setup lang="ts">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { marked } from "marked";

const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
const { editedItem } = storeToRefs(tableEditorStore);
const fileHistoryStore = useFileHistoryStore();
const { undo } = fileHistoryStore;
const { isUndoable, undoDescription } = storeToRefs(fileHistoryStore);
const tooltipHtml = computed(() => {
  const [title, ...rest] = (undoDescription.value ?? "").split("\n\n");
  const parts = [`Undo: ${title} *(Ctrl+Z)*`, ...rest];
  return sanitizeHtml(marked.parse(parts.join("\n\n"), { async: false }));
});

onKeyStroke(["z", "Z"], ({ ctrlKey, metaKey, preventDefault, shiftKey }) => {
  if ((!ctrlKey && !metaKey) || shiftKey) return;
  preventDefault();
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
