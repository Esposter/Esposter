<script setup lang="ts">
import { useReplyStore } from "@/store/esbabbler/reply";

const route = useRoute();
const replyStore = useReplyStore();
const { onIndicatorClick } = replyStore;

onMounted(() => {
  const rowKey = route.params.rowKey as string;
  if (!rowKey) return;
  onIndicatorClick(rowKey);
});
</script>

<template>
  <NuxtLayout name="messages" />
</template>
