<script setup lang="ts">
import { useTemplateRef } from "vue";

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
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
  transition: transform 0.25s ease-out;
}
</style>
