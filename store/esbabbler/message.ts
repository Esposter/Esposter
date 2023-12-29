import { type MessageEntity } from "@/models/esbabbler/message";
import {
  type CreateMessageInput,
  type DeleteMessageInput,
  type UpdateMessageInput,
} from "@/server/trpc/routers/message";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/createCursorPaginationDataMap";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";
import { EMPTY_TEXT_REGEX } from "@/util/text";
import { type Editor } from "@tiptap/core";

export const useMessageStore = defineStore("esbabbler/message", () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageInputStore = useMessageInputStore();
  const { messageInput } = storeToRefs(messageInputStore);
  const {
    itemList: messageList,
    pushItemList: pushMessageList,
    ...rest
  } = createCursorPaginationDataMap<MessageEntity, "rowKey">(currentRoomId);
  // Unfortunately we cannot keep the consistency here of calling trpc in our store crud functions
  // since it's also used in subscriptions to receive messages created by other people :C
  const createMessage = (newMessage: MessageEntity) => {
    messageList.value.unshift(newMessage);
  };
  const sendMessage = async (editor: Editor) => {
    if (!currentRoomId.value || EMPTY_TEXT_REGEX.test(editor.getText())) return;
    // We store the message first before clearing the content as we want to optimistically
    // clear the message content before the api call for good UX
    const createMessageInput: CreateMessageInput = { roomId: currentRoomId.value, message: messageInput.value };
    editor.commands.clearContent(true);
    const newMessage = await $client.message.createMessage.mutate(createMessageInput);
    if (!newMessage) return;

    createMessage(newMessage);
  };
  const updateMessage = (input: UpdateMessageInput) => {
    const index = messageList.value.findIndex(
      (m) => m.partitionKey === input.partitionKey && m.rowKey === input.rowKey,
    );
    if (index > -1) messageList.value[index] = { ...messageList.value[index], ...input };
  };
  const deleteMessage = ({ partitionKey, rowKey }: DeleteMessageInput) => {
    messageList.value = messageList.value.filter((m) => !(m.partitionKey === partitionKey && m.rowKey === rowKey));
  };

  return {
    messageList,
    pushMessageList,
    ...rest,
    createMessage,
    sendMessage,
    updateMessage,
    deleteMessage,
  };
});
