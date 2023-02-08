<script setup lang="ts">
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";

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
      partitionKey: currentRoomId,
      cursor: messageListNextCursor,
    });
    pushMessageList(messages);
    updateMessageListNextCursor(nextCursor);
  } finally {
    onComplete();
  }
};

if (currentRoomId) {
  const { messages, nextCursor } = await $client.message.readMessages.query({
    partitionKey: currentRoomId,
    cursor: null,
  });
  initialiseMessageList(messages);
  updateMessageListNextCursor(nextCursor);
}
</script>

<template>
  <ChatModelMessageList :messages="messageList" :has-more="hasMore" :fetch-more-messages="fetchMoreMessages" />
</template>
