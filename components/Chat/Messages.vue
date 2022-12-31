<script setup lang="ts">
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId } = $(storeToRefs(roomStore));
const messageStore = useMessageStore();
const {
  pushMessageList,
  updateMessageListNextCursor,
  initialiseMessageList,
  createMessage,
  updateMessage,
  deleteMessage,
} = messageStore;
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

  $client.message.onCreateMessage.subscribe({ partitionKey: currentRoomId }, { onData: (data) => createMessage(data) });
  $client.message.onUpdateMessage.subscribe({ partitionKey: currentRoomId }, { onData: (data) => updateMessage(data) });
  $client.message.onDeleteMessage.subscribe({ partitionKey: currentRoomId }, { onData: (data) => deleteMessage(data) });
}
</script>

<template>
  <ChatModelMessageList :messages="messageList" :has-more="hasMore" :fetch-more-messages="fetchMoreMessages" />
</template>
