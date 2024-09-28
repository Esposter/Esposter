<script setup lang="ts">
const { onDragStart } = useDragAndDrop();
const { text } = useColors();
</script>

<template>
  <v-list flex flex-col items-center gap-y-4>
    <v-list-item class="text-h5">Components</v-list-item>
    <v-list-item
      class="vue-flow__node-default bg-surface item"
      cursor-pointer
      :draggable="true"
      @dragstart="onDragStart($event)"
    />
  </v-list>
</template>

<style scoped lang="scss">
.item {
  border: 1px $border-style-root v-bind(text);
}
</style>
