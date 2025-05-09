import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Editor } from "@tiptap/core";

import { createMessageEntity } from "#shared/services/esbabbler/createMessageEntity";
import { AzureEntityType } from "@/models/shared/entity/AzureEntityType";
import { authClient } from "@/services/auth/authClient";
import { createDataMap } from "@/services/shared/createDataMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

export const useMessageStore = defineStore("esbabbler/message", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const messageInputStore = useMessageInputStore();
  const { items, ...restData } = createCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const {
    createMessage: baseStoreCreateMessage,
    deleteMessage: baseStoreDeleteMessage,
    updateMessage: storeUpdateMessage,
    ...restOperationData
  } = createOperationData(items, ["partitionKey", "rowKey"], AzureEntityType.Message);

  const storeCreateMessage = (message: MessageEntity) => {
    if (message.replyRowKey) {
      const reply = restOperationData.messages.value.find(({ rowKey }) => rowKey === message.replyRowKey);
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
    if (!session.value.data || !roomStore.currentRoomId || EMPTY_TEXT_REGEX.test(editor.getText())) return;

    const savedMessageInput = messageInputStore.messageInput;
    const savedreplyRowKey = messageInputStore.replyRowKey;
    const savedFiles = messageInputStore.files;
    editor.commands.clearContent(true);
    messageInputStore.replyRowKey = undefined;
    messageInputStore.files = [];
    const createMessageInput: CreateMessageInput = {
      files: savedFiles,
      message: savedMessageInput,
      replyRowKey: savedreplyRowKey,
      roomId: roomStore.currentRoomId,
    };
    const newMessage = reactive(
      createMessageEntity({
        ...createMessageInput,
        isLoading: true,
        userId: session.value.data.user.id,
      }),
    );
    storeCreateMessage(newMessage);
    Object.assign(newMessage, await $trpc.message.createMessage.mutate(createMessageInput));
    delete newMessage.isLoading;
  };
  const { data: replyMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, MessageEntity>());
  const activeReplyRowKey = ref<string>();
  const typings = ref<CreateTypingInput[]>([]);
  // We only expose the internal store crud message functions for subscriptions
  // everything else will directly use trpc mutations that are tracked by the related subscriptions
  return {
    storeCreateMessage,
    storeDeleteMessage,
    storeUpdateMessage,
    ...restOperationData,
    sendMessage,
    ...restData,
    activeReplyRowKey,
    replyMap,
    typings,
  };
});
