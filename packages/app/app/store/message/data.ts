import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteFileInput } from "#shared/models/db/message/DeleteFileInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { MessageEvents } from "#shared/models/message/events/MessageEvents";
import type { MessageEntity, StandardCreateMessageInput } from "@esposter/db-schema";
import type { Editor } from "@tiptap/core";

import { getIsEntityIdEqualComparator } from "#shared/services/entity/getIsEntityIdEqualComparator";
import { useMutation } from "@/composables/shared/useMutation";
import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { authClient } from "@/services/auth/authClient";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { useAlertStore } from "@/store/alert";
import { useInputStore } from "@/store/message/input";
import { useReplyStore } from "@/store/message/input/reply";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { useRoomStore } from "@/store/message/room";
import { AzureEntityType, createMessageEntity, MessageType } from "@esposter/db-schema";
import { getResultAsync, Operation } from "@esposter/shared";

export const useDataStore = defineStore("message/data", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const { createAlert } = useAlertStore();
  const roomStore = useRoomStore();
  const { items, ...restData } = useCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  const {
    createMessage: baseStoreCreateMessage,
    deleteMessage: baseStoreDeleteMessage,
    updateMessage: baseStoreUpdateMessage,
    ...restOperationData
  } = createOperationData(items, CompositeAzureKeyPath, AzureEntityType.Message);
  const files = computed(() => items.value.flatMap(({ files: messageFiles }) => messageFiles));
  const hasMoreNewer = ref(false);
  const nextCursorNewer = ref("");
  const typings = ref<CreateTypingInput[]>([]);

  const createMessage = (input: StandardCreateMessageInput) => {
    if (!session.value.data) return false;

    const newMessage = reactive(createMessageEntity({ ...input, isLoading: true, userId: session.value.data.user.id }));
    return getResultAsync(async () => {
      await storeCreateMessage(newMessage);
      Object.assign(newMessage, await $trpc.message.createMessage.mutate(input));
      delete newMessage.isLoading;
    }).match(
      () => true,
      (error) => {
        // A rejected Create hook (e.g. the attachment URL fetch) or mutation must not strand the optimistic
        // Loading bubble in the list, so roll the entity back out before surfacing the failure.
        baseStoreDeleteMessage(newMessage);
        createAlert(error.message, "error");
        return false;
      },
    );
  };
  const updateMessage = async (input: UpdateMessageInput) => {
    const message = items.value.find(getIsEntityIdEqualComparator(CompositeAzureKeyPath, input));
    const previousMessage = message?.message;
    await executeMutation(() => $trpc.message.updateMessage.mutate(input), {
      // Apply only the raw reactive field change — the subscription echo re-runs MessageHookMap on success,
      // So calling storeUpdateMessage here would double-fire the update hooks.
      applyOptimistic: () => {
        baseStoreUpdateMessage(input);
        return () => {
          if (previousMessage !== undefined) baseStoreUpdateMessage({ ...input, message: previousMessage });
        };
      },
      // Keyed per message so edits to different messages through this shared executor never stale-drop each other
      key: input.rowKey,
    });
  };
  const deleteFile = async ({ id, ...compositeKey }: DeleteFileInput) => {
    const message = items.value.find(getIsEntityIdEqualComparator(CompositeAzureKeyPath, compositeKey));
    if (!message) return;

    const previousFiles = message.files;
    await executeMutation(() => $trpc.message.deleteFile.mutate({ id, ...compositeKey }), {
      // Apply only the raw reactive change — the subscription echo re-runs MessageHookMap on success.
      applyOptimistic: () => {
        baseStoreUpdateMessage({ ...compositeKey, files: previousFiles.filter((file) => file.id !== id) });
        return () => {
          baseStoreUpdateMessage({ ...compositeKey, files: previousFiles });
        };
      },
      // Keyed per file so concurrent deletions never swallow each other's rollbacks
      key: id,
    });
  };
  const storeCreateMessage = async (message: MessageEntity) => {
    // Push first (our list is reversed — most recent at the front) so the bubble renders immediately in its loading
    // State, THEN run the Create hooks. One of those hooks fetches attachment download URLs over the network, so
    // Running it before the push would gate the "optimistic" render behind a round-trip for any message with files.
    baseStoreCreateMessage(message, true);
    await MessageHookMap[Operation.Create].run(message);
  };
  const storeUpdateMessage = async (input: MessageEvents["updateMessage"][number]) => {
    await MessageHookMap[Operation.Update].run(input);
    baseStoreUpdateMessage(input);
  };
  const storeDeleteMessage = async (input: DeleteMessageInput) => {
    await MessageHookMap[Operation.Delete].run(input);
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
    await MessageHookMap.ResetSend.run(editor);
    if (await createMessage(input)) clearDraft(input.roomId);
  };
  MessageHookMap.ResetSend.register((editor) => {
    editor?.commands.clearContent(true);
  });
  // Only expose the internal store CRUD functions for subscriptions; everything else directly calls
  // The $trpc mutations, tracked by their related subscriptions.
  return {
    createMessage,
    deleteFile,
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
