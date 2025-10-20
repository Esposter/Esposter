import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { MessageEvents } from "#shared/models/message/events/MessageEvents";
import type { MessageEntity, StandardCreateMessageInput } from "@esposter/db-schema";
import type { Editor } from "@tiptap/core";

import { authClient } from "@/services/auth/authClient";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { useInputStore } from "@/store/message/input";
import { useReplyStore } from "@/store/message/reply";
import { useRoomStore } from "@/store/message/room";
import { useUploadFileStore } from "@/store/message/uploadFile";
import { AzureEntityType, createMessageEntity, MessageType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const useDataStore = defineStore("message/data", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { items, ...restData } = useCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const {
    createMessage: baseStoreCreateMessage,
    deleteMessage: baseStoreDeleteMessage,
    updateMessage: baseStoreUpdateMessage,
    ...restOperationData
  } = createOperationData(items, ["partitionKey", "rowKey"], AzureEntityType.Message);
  const files = computed(() => items.value.flatMap(({ files }) => files));
  const hasMoreNewer = ref(false);
  const nextCursorNewer = ref<string>();

  const createMessage = async (input: StandardCreateMessageInput) => {
    if (!session.value.data) return;

    const newMessage = reactive(createMessageEntity({ ...input, isLoading: true, userId: session.value.data.user.id }));
    await storeCreateMessage(newMessage);
    Object.assign(newMessage, await $trpc.message.createMessage.mutate(input));
    delete newMessage.isLoading;
  };
  const updateMessage = async (input: UpdateMessageInput) => {
    await $trpc.message.updateMessage.mutate(input);
  };
  const storeCreateMessage = async (message: MessageEntity) => {
    await Promise.all(MessageHookMap[Operation.Create].map((fn) => Promise.resolve(fn(message))));
    // Our messages list is reversed i.e. most recent messages are at the front
    baseStoreCreateMessage(message, true);
  };
  const storeUpdateMessage = async (input: MessageEvents["updateMessage"][number]) => {
    await Promise.all(MessageHookMap[Operation.Update].map((fn) => Promise.resolve(fn(input))));
    baseStoreUpdateMessage(input);
  };
  const storeDeleteMessage = async (input: DeleteMessageInput) => {
    await Promise.all(MessageHookMap[Operation.Delete].map((fn) => Promise.resolve(fn(input))));
    baseStoreDeleteMessage(input);
  };

  const inputStore = useInputStore();
  const { validateInput } = inputStore;
  const uploadFileStore = useUploadFileStore();
  const replyStore = useReplyStore();
  const sendMessage = async (editor: Editor) => {
    if (!roomStore.currentRoomId || !validateInput(editor, true)) return;

    const input: StandardCreateMessageInput = {
      files: uploadFileStore.files,
      message: inputStore.input,
      replyRowKey: replyStore.rowKey,
      roomId: roomStore.currentRoomId,
      type: MessageType.Message,
    };
    await Promise.all(MessageHookMap.ResetSend.map((fn) => Promise.resolve(fn(editor))));
    await createMessage(input);
  };
  MessageHookMap.ResetSend.push((editor) => {
    editor.commands.clearContent(true);
  });
  const typings = ref<CreateTypingInput[]>([]);
  // We only expose the internal store crud message functions for subscriptions
  // everything else will directly use trpc mutations that are tracked by the related subscriptions
  return {
    createMessage,
    files,
    hasMoreNewer,
    items,
    nextCursorNewer,
    storeCreateMessage,
    storeDeleteMessage,
    storeUpdateMessage,
    updateMessage,
    ...restOperationData,
    sendMessage,
    ...restData,
    typings,
  };
});
