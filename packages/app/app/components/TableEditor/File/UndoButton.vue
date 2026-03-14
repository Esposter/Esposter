<script setup lang="ts">
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const { isUndoable, undo, undoDescription } = useEditedItemDataSourceOperations();
const tooltipHtml = computed(() => {
  const [title, ...rest] = (undoDescription.value ?? "").split("\n\n");
  const parts = [`Undo: ${title} *(Ctrl+Z)*`, ...rest];
  return sanitizeHtml(marked.parse(parts.join("\n\n"), { async: false }));
});

onKeyStroke(["z", "Z"], ({ ctrlKey, metaKey, preventDefault, shiftKey }) => {
  if ((!ctrlKey && !metaKey) || shiftKey) return;
  preventDefault();
  undo();
});
</script>

<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn :disabled="!isUndoable" icon="mdi-undo" variant="text" :="props" @click="undo()" />
    </template>
    <div v-html="tooltipHtml" />
  </v-tooltip>
</template>
