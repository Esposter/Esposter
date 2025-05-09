<script setup lang="ts">
const { isOverDropZone } = useDropZone(document);
</script>

<template>
  <v-overlay v-model="isOverDropZone" justify-center items-center text-xl>Drop files here</v-overlay>
</template>
