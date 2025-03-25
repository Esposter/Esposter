import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { Editor } from "@tiptap/core";

import { AzureEntityType } from "@/models/shared/entity/AzureEntityType";
import { createAzureOperationData } from "@/services/shared/pagination/createAzureOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

export const useMessageStore = defineStore("esbabbler/message", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const messageInputStore = useMessageInputStore();
  const { itemList, ...restData } = createCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const {
    createMessage: baseStoreCreateMessage,
    deleteMessage: storeDeleteMessage,
    updateMessage: storeUpdateMessage,
    ...restOperationData
  } = createAzureOperationData(itemList, AzureEntityType.Message);
  // Our messages list is reversed
  // i.e. most recent messages are at the front
  const storeCreateMessage = (message: MessageEntity) => {
    baseStoreCreateMessage(message, true);
  };

  const sendMessage = async (editor: Editor) => {
    if (!roomStore.currentRoomId || EMPTY_TEXT_REGEX.test(editor.getText())) return;

    const savedMessageInput = messageInputStore.messageInput;
    editor.commands.clearContent(true);
    await createMessage({ message: savedMessageInput, roomId: roomStore.currentRoomId });
  };

  const createMessage = async (input: CreateMessageInput) => {
    const newMessage = await $trpc.message.createMessage.mutate(input);
    storeCreateMessage(newMessage);
  };
  const updateMessage = async (input: UpdateMessageInput) => {
    const updatedMessage = await $trpc.message.updateMessage.mutate(input);
    storeUpdateMessage(updatedMessage);
  };
  const deleteMessage = async (input: DeleteMessageInput) => {
    const deletedMessageId = await $trpc.message.deleteMessage.mutate(input);
    storeDeleteMessage(deletedMessageId);
  };
  // We need to expose the internal store crud message functions
  // since it's also used in subscriptions to receive messages created by other people
  return {
    storeCreateMessage,
    storeDeleteMessage,
    storeUpdateMessage,
    ...restOperationData,
    deleteMessage,
    sendMessage,
    updateMessage,
    ...restData,
  };
});
