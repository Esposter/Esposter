<script setup lang="ts">
const { isUndoable, undo } = useEditedItemDataSource();

onKeyStroke(["z", "Z"], ({ ctrlKey, metaKey, shiftKey, preventDefault }) => {
  if ((!ctrlKey && !metaKey) || shiftKey) return;
  preventDefault();
  undo();
});
</script>

<template>
  <v-btn :disabled="!isUndoable" icon="mdi-undo" variant="text" @click="undo()" />
</template>
