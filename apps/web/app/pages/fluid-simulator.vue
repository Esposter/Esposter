<script setup lang="ts">
const container = useTemplateRef("container");
useFluidSimulator(() => container.value ?? undefined);
</script>

<template>
  <NuxtLayout is-viewport-height>
    <div ref="container" size-full />
  </NuxtLayout>
</template>

<style scoped>
:deep(.profiler-toggle) {
  top: 0.9375rem;
}
/* three.js profiler blocks the app menus since it is set to z-index 9999 */
:deep(.profiler-mini-panel) {
  top: 3.75rem;
  z-index: 0;
}
</style>
