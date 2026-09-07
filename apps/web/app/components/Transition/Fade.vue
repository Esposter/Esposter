<script setup lang="ts">
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <Transition name="fade">
    <slot />
  </Transition>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -- transition classes land on slotted (often teleported Vuetify) content, which scoped/:slotted attributes cannot reach -->
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
