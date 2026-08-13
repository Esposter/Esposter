<script setup lang="ts">
interface RoomSettingsFieldProps {
  hint?: string;
  title: string;
}

defineSlots<{ default: () => VNode }>();
const { hint = "", title } = defineProps<RoomSettingsFieldProps>();
</script>

<template>
  <div flex flex-col gap-2>
    <div font-semibold>{{ title }}</div>
    <slot />
    <span v-if="hint" text-hint>{{ hint }}</span>
  </div>
</template>
