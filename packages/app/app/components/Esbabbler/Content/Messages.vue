<script setup lang="ts">
import { useMessageStore } from "@/store/esbabbler/message";

const readMoreMessages = await useReadMessages();
const messageStore = useMessageStore();
const { hasMore, messageList } = storeToRefs(messageStore);
</script>

<template>
  <EsbabblerModelMessageList v-if="messageList" :messages="messageList" :has-more :read-more-messages />
</template>
