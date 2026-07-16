<script setup lang="ts">
interface StyledEmptyStateProps {
  description?: string;
  icon?: string;
  title: string;
}

const { description, icon = "mdi-inbox-outline", title } = defineProps<StyledEmptyStateProps>();
defineSlots<{ default?: () => VNode }>();
</script>

<template>
  <div p-8 text-center flex flex-col gap-3 items-center justify-center>
    <v-icon :icon size="64" op-medium-emphasis />
    <div text-h6>{{ title }}</div>
    <div v-if="description" op-medium-emphasis>{{ description }}</div>
    <slot />
  </div>
</template>
