import type { AzureUpdateEntity } from "@/models/azure";
import type { MessageEntity } from "@/models/azure/message";
import type { CreateMessageInput, DeleteMessageInput } from "@/server/trpc/routers/message";
import { useMessageInputStore } from "@/store/chat/useMessageInputStore";
import { useRoomStore } from "@/store/chat/useRoomStore";

export const useMessageStore = defineStore("chat/message", () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = $(storeToRefs(roomStore));
  const messageInputStore = useMessageInputStore();

  const messagesMap = ref<Record<string, MessageEntity[]>>({});
  const messageList = computed(() => {
    if (!currentRoomId || !messagesMap.value[currentRoomId]) return null;
    return messagesMap.value[currentRoomId];
  });
  const pushMessageList = (messages: MessageEntity[]) => {
    if (!currentRoomId || !messagesMap.value[currentRoomId]) return;
    messagesMap.value[currentRoomId].push(...messages);
  };

  const messageListNextCursorMap = ref<Record<string, string | null>>({});
  const messageListNextCursor = computed(() => {
    if (!currentRoomId || !messageListNextCursorMap.value[currentRoomId]) return null;
    return messageListNextCursorMap.value[currentRoomId];
  });
  const updateMessageListNextCursor = (messageListNextCursor: string | null) => {
    if (!currentRoomId) return;
    messageListNextCursorMap.value[currentRoomId] = messageListNextCursor;
  };

  const initialiseMessageList = (messages: MessageEntity[]) => {
    if (!currentRoomId) return;
    messagesMap.value[currentRoomId] = messages;
  };
  const createMessage = (newMessage: CreateMessageInput & MessageEntity) => {
    if (!currentRoomId || !messagesMap.value[currentRoomId]) return;
    messagesMap.value[currentRoomId].unshift(newMessage);
  };
  const sendMessage = async () => {
    if (!currentRoomId || !messageInputStore.messageInput) return;

    const createMessageInput: CreateMessageInput = {
      partitionKey: currentRoomId,
      message: messageInputStore.messageInput,
    };
    messageInputStore.updateMessageInput("");
    const newMessage = await $client.message.createMessage.mutate(createMessageInput);
    if (newMessage) createMessage(newMessage);
  };
  const updateMessage = (updatedMessage: AzureUpdateEntity<MessageEntity>) => {
    if (!currentRoomId || !messagesMap.value[currentRoomId]) return;

    const messages = messagesMap.value[currentRoomId];
    const index = messages.findIndex(
      (m) => m.partitionKey === updatedMessage.partitionKey && m.rowKey === updatedMessage.rowKey
    );
    if (index > -1) messagesMap.value[currentRoomId][index] = { ...messages[index], ...updatedMessage };
  };
  const deleteMessage = (input: DeleteMessageInput) => {
    if (!currentRoomId || !messagesMap.value[currentRoomId]) return;

    const messages = messagesMap.value[currentRoomId];
    messagesMap.value[currentRoomId] = messages.filter(
      (m) => !(m.partitionKey === input.partitionKey && m.rowKey === input.rowKey)
    );
  };

  return {
    messageList,
    pushMessageList,
    messageListNextCursor,
    updateMessageListNextCursor,
    initialiseMessageList,
    createMessage,
    sendMessage,
    updateMessage,
    deleteMessage,
  };
});
