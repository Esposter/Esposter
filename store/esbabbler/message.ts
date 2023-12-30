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

  const sendMessage = async (editor: Editor) => {
    if (!currentRoomId.value || EMPTY_TEXT_REGEX.test(editor.getText())) return;

    const savedMessageInput = messageInput.value;
    editor.commands.clearContent(true);
    await createMessage({ roomId: currentRoomId.value, message: savedMessageInput });
  };

  const createMessage = async (input: CreateMessageInput) => {
    const newMessage = await $client.message.createMessage.mutate(input);
    if (!newMessage) return;

    storeCreateMessage(newMessage);
  };
  const updateMessage = async (input: UpdateMessageInput) => {
    const updatedMessage = await $client.message.updateMessage.mutate(input);
    if (!updatedMessage) return;

    storeUpdateMessage(updatedMessage);
  };
  const deleteMessage = async (input: DeleteMessageInput) => {
    const deletedMessage = await $client.message.deleteMessage.mutate(input);
    if (!deletedMessage) return;

    storeDeleteMessage(deletedMessage);
  };

  // We need to expose the internal store crud message functions
  // since it's also used in subscriptions to receive messages created by other people
  const storeCreateMessage = (newMessage: MessageEntity) => {
    messageList.value.unshift(newMessage);
  };
  const storeUpdateMessage = (input: UpdateMessageInput) => {
    const index = messageList.value.findIndex(
      (m) => m.partitionKey === input.partitionKey && m.rowKey === input.rowKey,
    );
    if (index > -1) messageList.value[index] = { ...messageList.value[index], ...input };
  };
  const storeDeleteMessage = ({ partitionKey, rowKey }: DeleteMessageInput) => {
    messageList.value = messageList.value.filter((m) => !(m.partitionKey === partitionKey && m.rowKey === rowKey));
  };

  return {
    messageList,
    pushMessageList,
    ...rest,
    sendMessage,
    updateMessage,
    deleteMessage,
    storeCreateMessage,
    storeUpdateMessage,
    storeDeleteMessage,
  };
});
