import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Editor } from "@tiptap/core";

import { AzureEntityType } from "#shared/models/azure/AzureEntityType";
import { createMessageEntity } from "#shared/services/esbabbler/createMessageEntity";
import { authClient } from "@/services/auth/authClient";
import { MessageHookMap } from "@/services/esbabbler/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useReplyStore } from "@/store/esbabbler/reply";
import { useRoomStore } from "@/store/esbabbler/room";
import { useUploadFileStore } from "@/store/esbabbler/uploadFile";
import { Operation } from "@esposter/shared";

export const useMessageStore = defineStore("esbabbler/message", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const {
    initializeCursorPaginationData: baseInitializeCursorPaginationData,
    items,
    resetCursorPaginationData: baseResetCursorPaginationData,
    ...restData
  } = createCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const {
    createMessage: baseStoreCreateMessage,
    deleteMessage: baseStoreDeleteMessage,
    messages,
    updateMessage: storeUpdateMessage,
    ...restOperationData
  } = createOperationData(items, ["partitionKey", "rowKey"], AzureEntityType.Message);
  const files = computed(() => messages.value.flatMap(({ files }) => files));
  const hasMoreNewer = ref(false);
  const nextCursorNewer = ref<string>();
  const initializeCursorPaginationData: typeof baseInitializeCursorPaginationData = (...args) => {
    baseInitializeCursorPaginationData(...args);
    hasMoreNewer.value = false;
    nextCursorNewer.value = undefined;
  };
  const resetCursorPaginationData: typeof baseResetCursorPaginationData = (...args) => {
    baseResetCursorPaginationData(...args);
    hasMoreNewer.value = false;
    nextCursorNewer.value = undefined;
  };

  const storeCreateMessage = async (message: MessageEntity) => {
    await Promise.all(MessageHookMap[Operation.Create].map((fn) => fn(message)));
    // Our messages list is reversed i.e. most recent messages are at the front
    baseStoreCreateMessage(message, true);
  };

  const storeDeleteMessage = async (input: DeleteMessageInput) => {
    await Promise.all(MessageHookMap[Operation.Delete].map((fn) => fn(input)));
    baseStoreDeleteMessage(input);
  };

  const messageInputStore = useMessageInputStore();
  const { validateMessageInput } = messageInputStore;
  const uploadFileStore = useUploadFileStore();
  const replyStore = useReplyStore();
  const sendMessage = async (editor: Editor) => {
    if (!session.value.data || !roomStore.currentRoomId || !validateMessageInput(editor, true)) return;

    const createMessageInput: CreateMessageInput = {
      files: uploadFileStore.files,
      message: messageInputStore.messageInput,
      replyRowKey: replyStore.rowKey,
      roomId: roomStore.currentRoomId,
    };
    await Promise.all(MessageHookMap.ResetSend.map((fn) => fn(editor)));
    const newMessage = reactive(
      createMessageEntity({
        ...createMessageInput,
        isLoading: true,
        userId: session.value.data.user.id,
      }),
    );
    await storeCreateMessage(newMessage);
    Object.assign(newMessage, await $trpc.message.createMessage.mutate(createMessageInput));
    delete newMessage.isLoading;
  };
  MessageHookMap.ResetSend.push((editor) => {
    editor.commands.clearContent(true);
  });
  const typings = ref<CreateTypingInput[]>([]);
  // We only expose the internal store crud message functions for subscriptions
  // everything else will directly use trpc mutations that are tracked by the related subscriptions
  return {
    files,
    hasMoreNewer,
    messages,
    nextCursorNewer,
    storeCreateMessage,
    storeDeleteMessage,
    storeUpdateMessage,
    ...restOperationData,
    initializeCursorPaginationData,
    resetCursorPaginationData,
    sendMessage,
    ...restData,
    typings,
  };
});
