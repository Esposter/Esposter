<script setup lang="ts">
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  description?: string;
  meaning: UiIconMeaning;
  title: string;
}

defineSlots<{ default?: () => VNode }>();
const { description, meaning, title } = defineProps<Props>();
</script>

<!-- Nothing to show yet: a mark, a sentence saying so, a line on how that changes, and at most one action -->
<template>
  <div p-8 text-center flex flex-col gap-3 items-center justify-center>
    <UiIcon :meaning text-muted />
    <p ui-heading>{{ title }}</p>
    <p v-if="description" text-muted>{{ description }}</p>
    <slot />
  </div>
</template>
