<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
const container = useTemplateRef("container");
const transform = useRotatingTransform(container);
</script>

<template>
  <div ref="container" class="container" transition-transform duration="[--transition-duration]" ease-out>
    <slot />
  </div>
</template>

<style scoped>
.container {
  transform: v-bind(transform);
}
</style>
