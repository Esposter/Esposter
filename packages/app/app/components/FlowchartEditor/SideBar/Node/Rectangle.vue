<script setup lang="ts">
const { text } = useColors();
</script>

<template>
  <v-list-item class="bg-surface vue-flow__node-default" />
</template>

<style scoped lang="scss">
.vue-flow__node-default {
  border: $border-width-root $border-style-root v-bind(text);
}
</style>
