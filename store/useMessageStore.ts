import type { DeleteMessageInput, UpdateMessageInput } from "@/server/trpc/message";
import type { MessageEntity } from "@/services/azure/types";
import { useRoomStore } from "@/store/useRoomStore";
import { defineStore } from "pinia";

export const useMessageStore = defineStore("messageStore", () => {
  const roomStore = useRoomStore();
  const messagesMap = ref<Record<string, MessageEntity[]>>({});
  const messages = computed(() => {
    if (!roomStore.currentRoomId || !messagesMap.value[roomStore.currentRoomId]) return [];
    return messagesMap.value[roomStore.currentRoomId];
  });
  const initialiseMessages = (messages: MessageEntity[]) => {
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
  const pushMessages = (messages: MessageEntity[]) => {
    if (!roomStore.currentRoomId) return;
    messagesMap.value[roomStore.currentRoomId].push(...messages);
  };

  const messageNextCursorMap = ref<Record<string, string | null>>({});
  const messageNextCursor = computed(() => {
    if (!roomStore.currentRoomId || !messageNextCursorMap.value[roomStore.currentRoomId]) return null;
    return messageNextCursorMap.value[roomStore.currentRoomId];
  });
  const updateMessageNextCursor = (messageNextCursor: string | null) => {
    if (!roomStore.currentRoomId) return;
    messageNextCursorMap.value[roomStore.currentRoomId] = messageNextCursor;
  };

  return {
    messages,
    initialiseMessages,
    createMessage,
    updateMessage,
    deleteMessage,
    pushMessages,
    messageNextCursor,
    updateMessageNextCursor,
  };
});
