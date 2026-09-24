<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
// Beside the panel on a wide screen, a tone below it as Discord's settings sidebar is; on a narrow one it folds away
// And covers the panel while open, toggled from the panel's header
const isOpen = defineModel<boolean>("open", { default: false });
</script>

<template>
  <aside
    :class="isOpen ? 'absolute inset-0 z-1 flex' : 'hidden'"
    md:w="1/4"
    bg-panel
    flex-col
    of-y-auto
    md:flex
    md:shrink-0
    md:static
  >
    <slot />
  </aside>
</template>
