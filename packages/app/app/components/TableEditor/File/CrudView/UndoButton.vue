<script setup lang="ts">
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { marked } from "marked";

const tableEditorStore = useTableEditorStore<DataSourceItem>();
const { editedItem, editForm } = storeToRefs(tableEditorStore);
const fileHistoryStore = useFileHistoryStore();
const { undo } = fileHistoryStore;
const { isUndoable, undoDescription } = storeToRefs(fileHistoryStore);
const tooltipHtml = computed(() => {
  const [title, ...rest] = (undoDescription.value ?? "").split("\n\n");
  const parts = [`Undo: ${title} *(Ctrl+Z)*`, ...rest];
  return sanitizeHtml(marked.parse(parts.join("\n\n"), { async: false }));
});

onKeyStroke(
  ["z", "Z"],
  (event) => {
    if ((!event.ctrlKey && !event.metaKey) || event.shiftKey) return;
    event.preventDefault();
    undo(editedItem.value);
  },
  { target: () => editForm.value?.$el },
);
</script>

<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn :disabled="!isUndoable" icon="mdi-undo" variant="text" :="props" @click="undo(editedItem)" />
    </template>
    <div v-html="tooltipHtml" />
  </v-tooltip>
</template>
