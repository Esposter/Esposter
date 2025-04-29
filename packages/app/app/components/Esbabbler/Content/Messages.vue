<script setup lang="ts">
import { useMessageStore } from "@/store/esbabbler/message";

const readMoreMessages = await useReadMessages();
const messageStore = useMessageStore();
const { hasMore, messages } = storeToRefs(messageStore);
</script>

<template>
  <EsbabblerModelMessageList :messages :has-more :read-more-messages />
</template>
