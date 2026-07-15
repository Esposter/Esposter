<script setup lang="ts">
interface MessageFriendsSectionProps {
  title: string;
}

defineSlots<{ default: () => VNode }>();
const { title } = defineProps<MessageFriendsSectionProps>();
</script>

<template>
  <div flex flex-col gap-y-3>
    <div text-title-large>{{ title }}</div>
    <slot />
  </div>
</template>
