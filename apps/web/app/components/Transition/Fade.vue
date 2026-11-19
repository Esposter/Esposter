<script setup lang="ts">
import type { TransitionProps } from "vue";

import { omitUndefined } from "@esposter/shared";

interface Props {
  // How the leaving and entering content take turns, which the transition does at once where it is absent
  mode?: TransitionProps["mode"] | undefined;
}

defineSlots<{ default: () => VNode }>();
defineProps<Props>();
</script>

<template>
  <Transition name="fade" :="omitUndefined({ mode })">
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
