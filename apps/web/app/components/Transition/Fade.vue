<script setup lang="ts">
import type { TransitionProps } from "vue";

defineSlots<{ default: () => VNode }>();
defineProps<{ mode?: TransitionProps["mode"] }>();
</script>

<template>
  <Transition name="fade" :mode>
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
