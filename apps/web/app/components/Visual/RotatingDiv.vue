<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
const container = useTemplateRef("container");
const transform = useRotatingTransform(container);
</script>

<template>
  <div class="container" ref="container">
    <slot />
  </div>
</template>

<style scoped>
.container {
  transform: v-bind(transform);
  transition: transform var(--ui-motion-medium);
}
</style>
