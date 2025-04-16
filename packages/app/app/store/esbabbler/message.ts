import type { User } from "#shared/db/schema/users";
import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Editor } from "@tiptap/core";

import { AzureEntityType } from "@/models/shared/entity/AzureEntityType";
import { createDataMap } from "@/services/shared/createDataMap";
import { createOperationData } from "@/services/shared/createOperationData";
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
    deleteMessage: baseStoreDeleteMessage,
    updateMessage: storeUpdateMessage,
    ...restOperationData
  } = createOperationData(itemList, ["partitionKey", "rowKey"], AzureEntityType.Message);

  const storeCreateMessage = (message: MessageEntity) => {
    if (message.replyRowKey) {
      const reply = restOperationData.messageList.value.find(({ rowKey }) => rowKey === message.replyRowKey);
      if (reply) replyMap.value.set(message.replyRowKey, reply);
    }
    // Our messages list is reversed i.e. most recent messages are at the front
    baseStoreCreateMessage(message, true);
  };

  const storeDeleteMessage = (input: DeleteMessageInput) => {
    replyMap.value.delete(input.rowKey);
    baseStoreDeleteMessage(input);
  };

  const sendMessage = async (editor: Editor) => {
    if (!roomStore.currentRoomId || EMPTY_TEXT_REGEX.test(editor.getText())) return;

    const savedMessageInput = messageInputStore.messageInput;
    const savedreplyRowKey = messageInputStore.reply?.rowKey;
    editor.commands.clearContent(true);
    messageInputStore.reply = undefined;
    await $trpc.message.createMessage.mutate({
      message: savedMessageInput,
      replyRowKey: savedreplyRowKey,
      roomId: roomStore.currentRoomId,
    });
  };
  const { data: creatorMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, User>());
  const { data: replyMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, MessageEntity>());
  const typingList = ref<CreateTypingInput[]>([]);
  // We only expose the internal store crud message functions for subscriptions
  // everything else will directly use trpc mutations that are tracked by the related subscriptions
  return {
    storeCreateMessage,
    storeDeleteMessage,
    storeUpdateMessage,
    ...restOperationData,
    sendMessage,
    ...restData,
    creatorMap,
    replyMap,
    typingList,
  };
});
