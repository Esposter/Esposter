<script setup lang="ts">
const divRef = ref<HTMLDivElement>();
const transform = useRotatingTransform(divRef);
</script>

<template>
  <div ref="divRef" class="div">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.div {
  transform: v-bind(transform);
  transition: transform 0.25s ease-out;
}
</style>
