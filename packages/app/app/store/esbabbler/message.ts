import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { DownloadFileUrl } from "@/models/esbabbler/file/DownloadFileUrl";
import type { Editor } from "@tiptap/core";

import { createMessageEntity } from "#shared/services/esbabbler/createMessageEntity";
import { AzureEntityType } from "@/models/shared/entity/AzureEntityType";
import { authClient } from "@/services/auth/authClient";
import { MessageHookMap } from "@/services/esbabbler/message/MessageHookMap";
import { createDataMap } from "@/services/shared/createDataMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useReplyStore } from "@/store/esbabbler/reply";
import { useRoomStore } from "@/store/esbabbler/room";
import { Operation } from "@esposter/shared";

export const useMessageStore = defineStore("esbabbler/message", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { items, ...restData } = createCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const {
    createMessage: baseStoreCreateMessage,
    deleteMessage: baseStoreDeleteMessage,
    messages,
    updateMessage: storeUpdateMessage,
    ...restOperationData
  } = createOperationData(items, ["partitionKey", "rowKey"], AzureEntityType.Message);

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
  const { getIsSendEnabled } = messageInputStore;
  const replyStore = useReplyStore();
  const sendMessage = async (editor: Editor) => {
    if (!session.value.data || !roomStore.currentRoomId || !getIsSendEnabled(editor)) return;

    const createMessageInput: CreateMessageInput = {
      files: messageInputStore.files,
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

  const { data: downloadFileUrlMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, DownloadFileUrl>());
  MessageHookMap[Operation.Create].push(async (message) => {
    if (!roomStore.currentRoomId || message.files.length === 0) return;

    const downloadFileSasUrls = await $trpc.message.generateDownloadFileSasUrls.query({
      files: message.files,
      roomId: roomStore.currentRoomId,
    });

    for (let i = 0; i < message.files.length; i++)
      downloadFileUrlMap.value.set(message.files[i].id, { url: downloadFileSasUrls[i] });
  });
  MessageHookMap[Operation.Delete].push((input) => {
    const message = messages.value.find(({ rowKey }) => rowKey === input.rowKey);
    if (!message) return;
    for (const { id } of message.files) downloadFileUrlMap.value.delete(id);
  });
  const typings = ref<CreateTypingInput[]>([]);
  // We only expose the internal store crud message functions for subscriptions
  // everything else will directly use trpc mutations that are tracked by the related subscriptions
  return {
    messages,
    storeCreateMessage,
    storeDeleteMessage,
    storeUpdateMessage,
    ...restOperationData,
    sendMessage,
    ...restData,
    downloadFileUrlMap,
    typings,
  };
});
