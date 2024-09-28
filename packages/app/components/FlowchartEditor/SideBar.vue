<script setup lang="ts">
const { onDragStart } = useDragAndDrop();
</script>

<template>
  <v-list flex flex-col items-center>
    <v-list-item
      class="vue-flow__node-default"
      cursor-pointer
      rd-2="!"
      :draggable="true"
      @dragstart="onDragStart($event)"
    />
  </v-list>
</template>
