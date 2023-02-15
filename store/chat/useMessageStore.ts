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
  const { updateMessageInput } = messageInputStore;
  const { messageInput } = $(storeToRefs(messageInputStore));

  const messagesMap = ref<Record<string, MessageEntity[]>>({});
  const messageList = computed({
    get: () => {
      if (!currentRoomId || !messagesMap.value[currentRoomId]) return [];
      return messagesMap.value[currentRoomId];
    },
    set: (newMessageList) => {
      if (!currentRoomId) return;
      messagesMap.value[currentRoomId] = newMessageList;
    },
  });
  const pushMessageList = (messages: MessageEntity[]) => {
    messageList.value.push(...messages);
  };

  const messageListNextCursorMap = ref<Record<string, string | null>>({});
  const messageListNextCursor = computed({
    get: () => {
      if (!currentRoomId || !messageListNextCursorMap.value[currentRoomId]) return null;
      return messageListNextCursorMap.value[currentRoomId];
    },
    set: (newMessageListNextCursor) => {
      if (!currentRoomId) return;
      messageListNextCursorMap.value[currentRoomId] = newMessageListNextCursor;
    },
  });
  const updateMessageListNextCursor = (updatedMessageListNextCursor: string | null) => {
    messageListNextCursor.value = updatedMessageListNextCursor;
  };

  const initialiseMessageList = (messages: MessageEntity[]) => {
    messageList.value = messages;
  };
  const createMessage = (newMessage: MessageEntity) => {
    messageList.value.unshift(newMessage);
  };
  const sendMessage = async () => {
    if (!currentRoomId || !messageInput) return;

    const createMessageInput: CreateMessageInput = {
      roomId: currentRoomId,
      message: messageInput,
    };
    updateMessageInput("");
    const newMessage = await $client.message.createMessage.mutate(createMessageInput);
    if (newMessage) createMessage(newMessage);
  };
  const updateMessage = (updatedMessage: AzureUpdateEntity<MessageEntity>) => {
    const index = messageList.value.findIndex(
      (m) => m.partitionKey === updatedMessage.partitionKey && m.rowKey === updatedMessage.rowKey
    );
    if (index > -1) messageList.value[index] = { ...messageList.value[index], ...updatedMessage };
  };
  const deleteMessage = (input: DeleteMessageInput) => {
    messageList.value = messageList.value.filter(
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
