<script setup lang="ts">
// A page that is a place of its own: no app bar, drawer or footer, and the whole viewport to draw in
defineSlots<{ default: () => VNode }>();
// The document never scrolls, so nothing a tool or extension appends to the body after the page shows a scrollbar
useHead({ htmlAttrs: { "of-hidden": "" } });
</script>

<template>
  <div of-hidden h-dvh>
    <slot />
  </div>
</template>
