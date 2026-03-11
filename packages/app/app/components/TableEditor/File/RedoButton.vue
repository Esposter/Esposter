<script setup lang="ts">
const { isRedoable, redo } = useEditedItemDataSource();

onKeyStroke(["z", "Z"], ({ ctrlKey, metaKey, shiftKey, preventDefault }) => {
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
  <v-btn :disabled="!isRedoable" icon="mdi-redo" variant="text" @click="redo()" />
</template>
