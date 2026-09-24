<script setup lang="ts">
// A page that is a place of its own: no app bar, drawer or footer, and the whole viewport to draw in
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <div of-hidden h-dvh>
    <slot />
  </div>
</template>
