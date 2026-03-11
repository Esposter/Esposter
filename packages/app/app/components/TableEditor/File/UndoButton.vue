<script setup lang="ts">
const { isUndoable, undo, undoDescription } = useEditedItemDataSource();

onKeyStroke(["z", "Z"], ({ ctrlKey, metaKey, preventDefault, shiftKey }) => {
  if ((!ctrlKey && !metaKey) || shiftKey) return;
  preventDefault();
  undo();
});
</script>

<template>
  <v-tooltip location="bottom" :text="`Undo: ${undoDescription} (Ctrl+Z)`">
    <template #activator="{ props }">
      <v-btn :disabled="!isUndoable" icon="mdi-undo" variant="text" v-bind="props" @click="undo()" />
    </template>
  </v-tooltip>
</template>
