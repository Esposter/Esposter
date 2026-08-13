<script setup lang="ts">
import type DefaultLayout from "@/layouts/default.vue";

const layout = useTemplateRef<{ layoutRef: InstanceType<typeof DefaultLayout> }>("layout");
useFluidSimulator(() => layout.value?.layoutRef.container);
</script>

<template>
  <NuxtLayout ref="layout" />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -- the three.js Inspector appends its profiler panels to document.body, outside this component's scope -->
<style>
#profiler-toggle {
  top: calc(var(--app-bar-height) + 0.9375rem) !important;
}
/* three.js profiler blocks the app menus since it is set to z-index 9999 */
#profiler-mini-panel {
  top: calc(var(--app-bar-height) + 3.75rem) !important;
  z-index: 0 !important;
}
</style>
