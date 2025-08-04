<script setup lang="ts">
const { onDragStart } = useDragAndDrop();
const { text } = useColors();
</script>

<template>
  <v-list-item
    class="vue-flow__node-default"
    cursor-pointer
    title="Base Node"
    :draggable="true"
    @dragstart="onDragStart($event)"
  />
</template>

<style scoped lang="scss">
.vue-flow__node-default {
  border: $border-width-root $border-style-root v-bind(text);
}
</style>
