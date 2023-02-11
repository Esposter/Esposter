import type { AzureUpdateEntity, CompositeKey } from "@/models/azure";
import type { MessageEntity } from "@/models/azure/message";
import type { CreateMessageInput } from "@/server/trpc/routers/message";
import { useMessageInputStore } from "@/store/useMessageInputStore";
import { useRoomStore } from "@/store/useRoomStore";

export const useMessageStore = defineStore("message", () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const messageInputStore = useMessageInputStore();
  const messagesMap = ref<Record<string, MessageEntity[]>>({});
  const messageList = computed(() => {
    if (!roomStore.currentRoomId || !messagesMap.value[roomStore.currentRoomId]) return [];
    return messagesMap.value[roomStore.currentRoomId];
  });
  const pushMessageList = (messages: MessageEntity[]) => {
    if (!roomStore.currentRoomId || !messagesMap.value[roomStore.currentRoomId]) return;
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
    if (!roomStore.currentRoomId || !messagesMap.value[roomStore.currentRoomId]) return;
    messagesMap.value[roomStore.currentRoomId].unshift(newMessage);
  };
  const sendMessage = async () => {
    if (!roomStore.currentRoomId || !messageInputStore.messageInput) return;

    const createMessageInput: CreateMessageInput = {
      partitionKey: roomStore.currentRoomId,
      message: messageInputStore.messageInput,
    };
    messageInputStore.updateMessageInput("");
    const newMessage = await $client.message.createMessage.mutate(createMessageInput);
    if (newMessage) createMessage(newMessage);
  };
  const updateMessage = (updatedMessage: AzureUpdateEntity<MessageEntity>) => {
    if (!roomStore.currentRoomId || !messagesMap.value[roomStore.currentRoomId]) return;

    const messages = messagesMap.value[roomStore.currentRoomId];
    const index = messages.findIndex(
      (m) => m.partitionKey === updatedMessage.partitionKey && m.rowKey === updatedMessage.rowKey
    );
    if (index > -1) messagesMap.value[roomStore.currentRoomId][index] = { ...messages[index], ...updatedMessage };
  };
  const deleteMessage = (id: CompositeKey) => {
    if (!roomStore.currentRoomId || !messagesMap.value[roomStore.currentRoomId]) return;

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
    sendMessage,
    updateMessage,
    deleteMessage,
  };
});
