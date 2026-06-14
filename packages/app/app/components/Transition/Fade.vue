<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <Transition name="fade">
    <slot />
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-move-duration) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
