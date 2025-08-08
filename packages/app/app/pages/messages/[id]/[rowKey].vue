<script setup lang="ts">
import { useMessageStore } from "@/store/esbabbler/message";
import { useReplyStore } from "@/store/esbabbler/reply";

const route = useRoute();
const messageStore = useMessageStore();
const { messages } = storeToRefs(messageStore);
const replyStore = useReplyStore();
const { onIndicatorClick } = replyStore;

onMounted(() => {
  const rowKey = route.params.rowKey as string;
  if (!rowKey) return;
  watchOnce(
    messages,
    () => {
      onIndicatorClick(rowKey);
    },
    { immediate: true },
  );
});
</script>

<template>
  <NuxtLayout name="messages" />
</template>
