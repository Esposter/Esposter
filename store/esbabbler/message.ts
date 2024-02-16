import { type MessageEntity } from "@/models/esbabbler/message";
import { AzureEntityType } from "@/models/shared/entity/AzureEntityType";
import {
  type CreateMessageInput,
  type DeleteMessageInput,
  type UpdateMessageInput,
} from "@/server/trpc/routers/message";
import { createAzureOperationData } from "@/services/shared/pagination/createAzureOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { type Editor } from "@tiptap/core";

export const useMessageStore = defineStore("esbabbler/message", () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageInputStore = useMessageInputStore();
  const { messageInput } = storeToRefs(messageInputStore);
  const { itemList, ...restData } = createCursorPaginationDataMap<MessageEntity>(currentRoomId);
  const {
    createMessage: storeCreateMessage,
    updateMessage: storeUpdateMessage,
    deleteMessage: storeDeleteMessage,
    ...restOperationData
  } = createAzureOperationData(itemList, AzureEntityType.Message);

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
    const deletedMessageId = await $client.message.deleteMessage.mutate(input);
    if (!deletedMessageId) return;

    storeDeleteMessage(deletedMessageId);
  };
  // We need to expose the internal store crud message functions
  // since it's also used in subscriptions to receive messages created by other people
  return {
    storeCreateMessage,
    storeUpdateMessage,
    storeDeleteMessage,
    ...restOperationData,
    sendMessage,
    updateMessage,
    deleteMessage,
    ...restData,
  };
});
