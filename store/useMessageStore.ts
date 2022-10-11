import { defineStore } from "pinia";
import type { DeleteMessageInput, UpdateMessageInput } from "@/server/trpc/message";
import type { MessageEntity } from "@/services/azure/types";
import { useRoomStore } from "@/store/useRoomStore";

export const useMessageStore = defineStore("message", () => {
  const roomStore = useRoomStore();
  const messagesMap = ref<Record<string, MessageEntity[]>>({});
  const messageList = computed(() => {
    if (!roomStore.currentRoomId || !messagesMap.value[roomStore.currentRoomId]) return [];
    return messagesMap.value[roomStore.currentRoomId];
  });
  const pushMessageList = (messages: MessageEntity[]) => {
    if (!roomStore.currentRoomId) return;
    messagesMap.value[roomStore.currentRoomId].push(...messages);
  };

  const messageListNextCursorMap = ref<Record<string, string | null>>({});
  const messageListNextCursor = computed(() => {
    if (!roomStore.currentRoomId || !messageListNextCursorMap.value[roomStore.currentRoomId]) return null;
    return messageListNextCursorMap.value[roomStore.currentRoomId];
  });
  const updateMessageListNextCursor = (messageListNextCursor: string | null) => {
    if (!roomStore.currentRoomId) return;
    messageListNextCursorMap.value[roomStore.currentRoomId] = messageListNextCursor;
  };

  const initialiseMessageList = (messages: MessageEntity[]) => {
    if (!roomStore.currentRoomId) return;
    messagesMap.value[roomStore.currentRoomId] = messages;
  };
  const createMessage = (newMessage: MessageEntity) => {
    if (!roomStore.currentRoomId) return;
    const messages = messagesMap.value[roomStore.currentRoomId];
    messagesMap.value[roomStore.currentRoomId] = [newMessage, ...messages];
  };
  const updateMessage = (updatedMessage: UpdateMessageInput) => {
    if (!roomStore.currentRoomId) return;

    const messages = messagesMap.value[roomStore.currentRoomId];
    const index = messages.findIndex(
      (m) => m.partitionKey === updatedMessage.partitionKey && m.rowKey === updatedMessage.rowKey
    );
    if (index > -1) messagesMap.value[roomStore.currentRoomId][index] = { ...messages[index], ...updatedMessage };
  };
  const deleteMessage = (id: DeleteMessageInput) => {
    if (!roomStore.currentRoomId) return;

    const messages = messagesMap.value[roomStore.currentRoomId];
    messagesMap.value[roomStore.currentRoomId] = messages.filter(
      (m) => !(m.partitionKey === id.partitionKey && m.rowKey === id.rowKey)
    );
  };

  return {
    messageList,
    pushMessageList,
    messageListNextCursor,
    updateMessageListNextCursor,
    initialiseMessageList,
    createMessage,
    updateMessage,
    deleteMessage,
  };
});
