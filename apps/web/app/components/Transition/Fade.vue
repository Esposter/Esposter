<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <Transition name="fade">
    <slot />
  </Transition>
</template>

<style scoped>
:global(.fade-enter-active),
:global(.fade-leave-active) {
  transition: opacity var(--ui-motion-medium);
}

:global(.fade-enter-from),
:global(.fade-leave-to) {
  opacity: 0;
}
</style>
