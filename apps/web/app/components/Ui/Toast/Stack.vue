<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<!-- Every toast in one corner, above the dock, announced as it arrives without taking focus from the page -->
<template>
  <section
    aria-label="Toasts"
    aria-live="polite"
    flex
    flex-col
    gap-3
    items-end
    right-4
    fixed
    z-2500
    bottom="[calc(var(--dock-inset-block-end)+1rem)]"
  >
    <slot />
  </section>
</template>
