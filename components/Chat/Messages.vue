<script setup lang="ts">
import type { MessageEntity } from "@/services/azure/types";
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = $(storeToRefs(roomStore));
const messageStore = useMessageStore();
const { pushMessageList, updateMessageListNextCursor, initialiseMessageList } = messageStore;
const { messageList, messageListNextCursor } = $(storeToRefs(messageStore));
const hasMore = $computed(() => Boolean(messageListNextCursor));
const fetchMoreMessages = async (onComplete: () => void) => {
  try {
    if (!currentRoomId) return;

    const { messages, nextCursor } = await $client.message.readMessages.query({
      filter: { partitionKey: currentRoomId },
      cursor: messageListNextCursor,
    });
    pushMessageList(messages);
    updateMessageListNextCursor(nextCursor);
  } finally {
    onComplete();
  }
};

const { messages, nextCursor } = currentRoomId
  ? await $client.message.readMessages.query({ filter: { partitionKey: currentRoomId }, cursor: null })
  : { messages: [] as MessageEntity[], nextCursor: null };
initialiseMessageList(messages);
updateMessageListNextCursor(nextCursor);

$client.message.onCreateMessage.subscribe(undefined, { onData: (data) => console.log("onCreateMessage subscription") });
</script>

<template>
  <ChatModelMessageList :messages="messageList" :has-more="hasMore" :fetch-more-messages="fetchMoreMessages" />
</template>
