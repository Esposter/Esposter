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
import { useReplyStore } from "@/store/message/input/reply";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { useRoomStore } from "@/store/message/room";
import { AzureEntityType, CompositeKeyPropertyNames, createMessageEntity, MessageType } from "@esposter/db-schema";
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
  } = createOperationData(
    items,
    [CompositeKeyPropertyNames.partitionKey, CompositeKeyPropertyNames.rowKey],
    AzureEntityType.Message,
  );
  const files = computed(() => items.value.flatMap(({ files }) => files));
  const hasMoreNewer = ref(false);
  const nextCursorNewer = ref("");
  const typings = ref<CreateTypingInput[]>([]);

  const createMessage = async (input: StandardCreateMessageInput) => {
    if (!session.value.data) return false;

    const newMessage = reactive(createMessageEntity({ ...input, isLoading: true, userId: session.value.data.user.id }));
    await storeCreateMessage(newMessage);
    Object.assign(newMessage, await $trpc.message.createMessage.mutate(input));
    delete newMessage.isLoading;
    return true;
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
  const { clearDraft, validateInput } = inputStore;
  const uploadFileStore = useUploadFileStore();
  const replyStore = useReplyStore();
  const sendMessage = async (editor: Editor) => {
    const roomId = roomStore.currentRoomId;
    if (!roomId || !validateInput(editor, true)) return;

    const input: StandardCreateMessageInput = {
      files: uploadFileStore.files,
      message: inputStore.input,
      replyRowKey: replyStore.rowKey,
      roomId,
      type: MessageType.Message,
    };
    await storeSendMessage(input, editor);
  };
  const storeSendMessage = async (input: StandardCreateMessageInput, editor?: Editor) => {
    await Promise.all(MessageHookMap.ResetSend.map((fn) => Promise.resolve(fn(editor))));
    if (await createMessage(input)) clearDraft(input.roomId);
  };
  MessageHookMap.ResetSend.push((editor) => {
    editor?.commands.clearContent(true);
  });
  // Only expose the internal store CRUD functions for subscriptions; everything else calls the
  // TRPC mutations directly, tracked by their related subscriptions.
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
    storeSendMessage,
    ...restData,
    typings,
  };
});
