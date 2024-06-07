<script setup lang="ts">
defineSlots<{ default: (props: Record<string, never>) => unknown }>();
</script>

<template>
  <Transition name="fade">
    <slot />
  </Transition>
</template>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
