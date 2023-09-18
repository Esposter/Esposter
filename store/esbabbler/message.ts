import type { MessageEntity } from "@/models/esbabbler/message";
import type { CreateMessageInput, DeleteMessageInput, UpdateMessageInput } from "@/server/trpc/routers/message";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";
import { EMPTY_TEXT_REGEX } from "@/util/text";
import type { Editor } from "@tiptap/core";

export const useMessageStore = defineStore("esbabbler/message", () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageInputStore = useMessageInputStore();
  const { messageInput } = storeToRefs(messageInputStore);

  const messagesMap = ref<Record<string, MessageEntity[]>>({});
  const messageList = computed({
    get: () => {
      if (!currentRoomId.value || !messagesMap.value[currentRoomId.value]) return [];
      return messagesMap.value[currentRoomId.value];
    },
    set: (newMessageList) => {
      if (!currentRoomId.value) return;
      messagesMap.value[currentRoomId.value] = newMessageList;
    },
  });
  const pushMessageList = (messages: MessageEntity[]) => {
    messageList.value.push(...messages);
  };

  const messageListNextCursorMap = ref<Record<string, string | null>>({});
  const messageListNextCursor = computed({
    get: () => {
      if (!currentRoomId.value || !messageListNextCursorMap.value[currentRoomId.value]) return null;
      return messageListNextCursorMap.value[currentRoomId.value];
    },
    set: (newMessageListNextCursor) => {
      if (!currentRoomId.value) return;
      messageListNextCursorMap.value[currentRoomId.value] = newMessageListNextCursor;
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
  const sendMessage = async (editor: Editor) => {
    if (!currentRoomId.value || EMPTY_TEXT_REGEX.test(editor.getText())) return;

    const createMessageInput: CreateMessageInput = { roomId: currentRoomId.value, message: messageInput.value };
    editor.commands.clearContent(true);
    const newMessage = await $client.message.createMessage.mutate(createMessageInput);
    if (newMessage) createMessage(newMessage);
  };
  const updateMessage = (input: UpdateMessageInput) => {
    const index = messageList.value.findIndex(
      (m) => m.partitionKey === input.partitionKey && m.rowKey === input.rowKey,
    );
    if (index > -1) messageList.value[index] = { ...messageList.value[index], ...input };
  };
  const deleteMessage = (input: DeleteMessageInput) => {
    messageList.value = messageList.value.filter(
      (m) => !(m.partitionKey === input.partitionKey && m.rowKey === input.rowKey),
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
