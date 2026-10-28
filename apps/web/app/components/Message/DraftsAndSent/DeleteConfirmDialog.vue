<script setup lang="ts">
import type { Promisable } from "type-fest";

interface Props {
  // What confirming does, which the write shows at once and rolls back on a rejection
  confirm: () => Promisable<unknown>;
  title: string;
}
// The question before a draft or a scheduled message is deleted, which shows at once, so the caller mounts it only
// While it is open
const isOpen = defineModel<boolean>({ default: false });
defineProps<Props>();
defineSlots<{ default: () => VNode }>();
</script>

<template>
  <UiConfirmDialog v-model="isOpen" confirm-label="Delete" :title is-optimistic :confirm>
    <slot />
  </UiConfirmDialog>
</template>
