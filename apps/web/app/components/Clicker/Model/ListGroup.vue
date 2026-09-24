<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  count: number;
  meaning: UiIconMeaning;
  title: string;
}

defineSlots<{ default: () => VNode }>();
const { count, meaning, title } = defineProps<Props>();
const isOpen = ref(true);
</script>

<template>
  <UiCollapsible v-model="isOpen">
    <template #title>
      <UiIcon :meaning />
      <span text-heading-color flex-1 truncate>{{ title }}</span>
      <span text-sm text-muted>{{ count }}</span>
    </template>
    <slot />
  </UiCollapsible>
</template>
