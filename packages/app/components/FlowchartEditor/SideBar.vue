<script setup lang="ts">
const { onDragStart } = useDragAndDrop();
</script>

<template>
  <v-list flex flex-col items-center gap-y-4>
    <v-list-item class="text-h5">Components</v-list-item>
    <v-list-item class="vue-flow__node-default" cursor-pointer :draggable="true" @dragstart="onDragStart($event)" />
  </v-list>
</template>
