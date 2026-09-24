<script setup lang="ts">
interface Props {
  hint?: string;
  // Drawn above a control that draws no label of its own, such as a select; a text field names itself
  title?: string;
}

defineSlots<{ default: () => VNode }>();
const { hint = "", title = "" } = defineProps<Props>();
</script>

<template>
  <div flex flex-col gap-1>
    <span v-if="title" text-sm text-muted>{{ title }}</span>
    <slot />
    <p v-if="hint" text-sm text-muted>{{ hint }}</p>
  </div>
</template>
