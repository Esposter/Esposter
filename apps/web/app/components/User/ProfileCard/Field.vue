<script setup lang="ts">
interface Props {
  label: string;
}

defineSlots<{ default: () => VNode }>();
const { label } = defineProps<Props>();
</script>

<!-- One saved value, read rather than edited: its name in the muted colour above it -->
<template>
  <div flex flex-col gap-1>
    <span text-muted>{{ label }}</span>
    <div break-anywhere><slot /></div>
  </div>
</template>
