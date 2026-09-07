<script setup lang="ts">
import type DefaultLayout from "@/layouts/default.vue";

const layout = useTemplateRef<{ layoutRef: InstanceType<typeof DefaultLayout> }>("layout");
useFluidSimulator(() => layout.value?.layoutRef.container);
</script>

<template>
  <NuxtLayout ref="layout" />
</template>

<style scoped>
:deep(.profiler-toggle) {
  top: calc(var(--app-bar-height) + 0.9375rem);
}
/* three.js profiler blocks the app menus since it is set to z-index 9999 */
:deep(.profiler-mini-panel) {
  top: calc(var(--app-bar-height) + 3.75rem);
  z-index: 0;
}
</style>
