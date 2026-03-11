<script setup lang="ts">
const { isRedoable, redo, redoDescription } = useEditedItemDataSource();

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
  <v-tooltip location="bottom" :text="`Redo: ${redoDescription} (Ctrl+Shift+Z)`">
    <template #activator="{ props }">
      <v-btn :disabled="!isRedoable" icon="mdi-redo" variant="text" v-bind="props" @click="redo()" />
    </template>
  </v-tooltip>
</template>
