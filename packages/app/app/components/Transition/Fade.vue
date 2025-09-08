<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <Transition name="fade">
    <slot />
  </Transition>
</template>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity $transition-move-duration-root ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
