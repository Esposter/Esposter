<script setup lang="ts">
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { sanitizeHtml } from "@/services/sanitizeHtml/sanitizeHtml";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { marked } from "marked";

const tableEditorStore = useTableEditorStore<DataSourceItem>();
const { editedItem, editForm } = storeToRefs(tableEditorStore);
const fileHistoryStore = useFileHistoryStore();
const { redo } = fileHistoryStore;
const { isRedoable, redoDescription } = storeToRefs(fileHistoryStore);
const tooltipHtml = computed(() => {
  const [title, ...rest] = (redoDescription.value ?? "").split("\n\n");
  const parts = [`Redo: ${title} *(Ctrl+Shift+Z)*`, ...rest];
  return sanitizeHtml(marked.parse(parts.join("\n\n"), { async: false }));
});

onKeyStroke(
  ["z", "Z"],
  (event) => {
    if ((!event.ctrlKey && !event.metaKey) || !event.shiftKey) return;
    event.preventDefault();
    redo(editedItem.value);
  },
  { target: () => editForm.value?.$el },
);

onKeyStroke(
  ["y", "Y"],
  (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    redo(editedItem.value);
  },
  { target: () => editForm.value?.$el },
);
</script>

<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn :disabled="!isRedoable" icon="mdi-redo" variant="text" :="props" @click="redo(editedItem)" />
    </template>
    <div v-html="tooltipHtml" />
  </v-tooltip>
</template>
