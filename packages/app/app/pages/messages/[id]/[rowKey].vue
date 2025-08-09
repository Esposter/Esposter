<script setup lang="ts">
import { useScrollToMessage } from "@/composables/esbabbler/useScrollToMessage";

const route = useRoute();
const scrollToMessage = useScrollToMessage();

onMounted(() => {
  const rowKey = route.params.rowKey as string;
  if (!rowKey) return;
  scrollToMessage(rowKey);
});
</script>

<template>
  <NuxtLayout name="messages" />
</template>
