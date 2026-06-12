<script setup lang="ts">
interface MessageDraftsSentEmptyStateProps {
  icon: string;
  title: string;
}

const { icon, title } = defineProps<MessageDraftsSentEmptyStateProps>();
</script>

<template>
  <div text-center flex flex-col h-full items-center justify-center>
    <v-icon :icon size="5rem" text-primary />
    <h2 font-bold mt-4 text-title-large>{{ title }}</h2>
  </div>
</template>
