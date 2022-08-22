<script setup lang="ts">
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const client = useClient();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const messageStore = useMessageStore();
const { pushMessageList, updateMessageListNextCursor, initialiseMessages } = messageStore;
const { messageList, messageListNextCursor } = storeToRefs(messageStore);
const hasMore = computed(() => Boolean(messageListNextCursor.value));
const fetchMoreMessages = async (finishLoading: () => void) => {
  if (!currentRoomId.value) return;

  const { messages, nextCursor } = await client.query("message.readMessages", {
    filter: { partitionKey: currentRoomId.value },
    cursor: messageListNextCursor.value,
  });
  pushMessageList(messages);
  updateMessageListNextCursor(nextCursor);
  finishLoading();
};

onMounted(async () => {
  const { messages, nextCursor } = currentRoomId.value
    ? await client.query("message.readMessages", { filter: { partitionKey: currentRoomId.value }, cursor: null })
    : { messages: [], nextCursor: null };

  initialiseMessages(messages);
  updateMessageListNextCursor(nextCursor);
});
</script>

<template>
  <v-list display="flex" flex="1 col-reverse" basis="full" lines="two">
    <ChatMessageListItem v-for="message in messageList" :key="message.rowKey" :message="message" />
    <Waypoint :active="hasMore" @change="fetchMoreMessages" />
  </v-list>
</template>
