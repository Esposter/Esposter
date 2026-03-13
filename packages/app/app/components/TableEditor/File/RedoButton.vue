<script setup lang="ts">
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const { isRedoable, redo, redoDescription } = useEditedItemDataSourceOperations();
const tooltipHtml = computed(() => {
  const [title, ...rest] = (redoDescription.value ?? "").split("\n\n");
  const parts = [`Redo: ${title} *(Ctrl+Shift+Z)*`, ...rest];
  return sanitizeHtml(marked.parse(parts.join("\n\n"), { async: false }));
});

onKeyStroke(["z", "Z"], ({ ctrlKey, metaKey, preventDefault, shiftKey }) => {
  if ((!ctrlKey && !metaKey) || !shiftKey) return;
  preventDefault();
  redo();
});

onKeyStroke(["y", "Y"], ({ ctrlKey, metaKey, preventDefault }) => {
  if (!ctrlKey && !metaKey) return;
  preventDefault();
  redo();
});
</script>

<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn :disabled="!isRedoable" icon="mdi-redo" variant="text" :="props" @click="redo()" />
    </template>
    <div v-html="tooltipHtml" />
  </v-tooltip>
</template>
