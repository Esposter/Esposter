<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
const container = useTemplateRef("container");
const transform = useRotatingTransform(container);
</script>

<template>
  <div ref="container" class="div">
    <slot />
  </div>
</template>

<style scoped>
.div {
  transform: v-bind(transform);
  transition: transform var(--transition-duration) ease-out;
}
</style>
