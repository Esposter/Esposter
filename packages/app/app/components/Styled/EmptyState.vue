<script setup lang="ts">
interface Props {
  description?: string;
  icon?: string;
  title: string;
}

const { description, icon = "mdi-inbox-outline", title } = defineProps<Props>();
defineSlots<{ default?: () => VNode }>();
</script>

<template>
  <div p-8 text-center flex flex-col gap-3 items-center justify-center>
    <v-icon op-medium-emphasis :icon size="4rem" />
    <div text-title-large>{{ title }}</div>
    <div v-if="description" op-medium-emphasis>{{ description }}</div>
    <slot />
  </div>
</template>
