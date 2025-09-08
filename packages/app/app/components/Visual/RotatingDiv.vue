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

<style scoped lang="scss">
.div {
  transform: v-bind(transform);
  transition: transform $transition-duration-root ease-out;
}
</style>
