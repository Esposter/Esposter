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
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { AzureEntityType, createMessageEntity, MessageType } from "@esposter/db-schema";
import { getResult, getResultAsync, noop, Operation } from "@esposter/shared";

export const useDataStore = defineStore("message/data", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const { createAlert } = useAlertStore();
  const roomStore = useRoomStore();
  const threadFollowStore = useThreadFollowStore();
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
    // Only the two steps that run before the server commits may roll the bubble back out. A rejection after
    // The mutation resolves means the message exists — deleting it then would hide a sent message from its own
    // Sender (the subscription echo is filtered for the sending session, so nothing restores it) and invite a
    // Duplicate resend. Those steps are local bookkeeping, so a failure leaves the bubble and surfaces the alert
    return getResultAsync(async () => {
      // A rejected Create hook (e.g. the attachment URL fetch) strands the optimistic loading bubble in the
      // List, so roll the entity back out before surfacing the failure — nothing has reached the server yet
      await storeCreateMessage(newMessage, true);
      return $trpc.message.createMessage.mutate(input);
    }).match(
      (createdMessage) => {
        Object.assign(newMessage, createdMessage);
        delete newMessage.isLoading;
        // The server auto-follows the thread a reply lands in, so mirror it here — the follow state is loaded
        // Once per room and would otherwise stay stale until a reload, showing Follow for a followed thread.
        // Best-effort: the message is already sent, so a failure here costs a stale Follow label, and neither
        // Rolling the bubble back nor rejecting the send would be a truthful way to report it. The wrapper is
        // Load-bearing rather than defensive about today's implementation — it is what the "keeps the message
        // When a step after the mutation rejects" test drives, and it is the boundary that keeps a future throw
        // Inside the follow store from un-sending a message that exists on the server
        const { replyRowKey } = input;
        if (replyRowKey)
          getResult(() => {
            threadFollowStore.storeFollowThread(input.roomId, replyRowKey);
          }).match(noop, console.error);
        return true;
      },
      (error) => {
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
  // The sender's own message is pushed first (our list is reversed — most recent at the front) so the bubble
  // Renders immediately in its loading state, THEN the Create hooks run: one of them fetches attachment download
  // Urls over the network, and running it before the push would gate the "optimistic" render behind a round trip.
  // A message arriving from anyone else has no bubble to keep responsive and nothing to roll back, so it waits for
  // Its urls — pushing it first renders every incoming attachment as a broken image until the fetch lands
  const storeCreateMessage = async (message: MessageEntity, isOptimistic = false) => {
    if (isOptimistic) {
      baseStoreCreateMessage(message, true);
      await MessageHookMap[Operation.Create].run(message);
    } else {
      await MessageHookMap[Operation.Create].run(message);
      baseStoreCreateMessage(message, true);
    }
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
