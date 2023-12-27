<script setup lang="ts">
import { useMessageStore } from "@/store/esbabbler/message";

const readMoreMessages = await useReadMessages();
const messageStore = useMessageStore();
const { messageList, hasMore } = storeToRefs(messageStore);
</script>

<template>
  <EsbabblerModelMessageList
    v-if="messageList"
    :messages="messageList"
    :has-more="hasMore"
    :read-more-messages="readMoreMessages"
  />
</template>
