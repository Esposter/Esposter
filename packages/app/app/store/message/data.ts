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
import { getIsAlertedByErrorLink } from "@/services/trpc/errorLink";
import { useAlertStore } from "@/store/alert";
import { useInputStore } from "@/store/message/input";
import { useReplyStore } from "@/store/message/input/reply";
import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { useRoomStore } from "@/store/message/room";
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { AzureEntityType, createMessageEntity, MessageType } from "@esposter/db-schema";
import { getResultAsync, Operation } from "@esposter/shared";

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

  // `onOptimisticCreate` runs once the bubble is in the list and before anything reaches the server — the
  // Composer reset hangs off it rather than off the send, because the bubble is the sender's only copy of what
  // They typed once the editor is cleared. It is handed the attachments this send took, so the composer stops
  // Offering them to the next Enter while it waits for `CommitSend` to drop them for good
  const createMessage = async (
    input: StandardCreateMessageInput,
    onOptimisticCreate?: (sentFileIds: string[]) => Promise<void>,
  ) => {
    if (!session.value.data) return false;

    // `input.files` is the composer's own live array, and the composer keeps accepting uploads for the whole
    // Round trip — so the attachments are snapshotted once, here, and that one snapshot is what the bubble
    // Carries, what goes on the wire, and what the hooks are handed. Reading the live array in any of those
    // Places lets them disagree: a file that lands mid-flight is serialized into the payload while the commit
    // Never hears about it, so it stays in the composer and rides along with the next send too — one blob
    // Referenced by two messages, and deleting either one reclaims a blob the other still renders
    const sentInput = input.files ? { ...input, files: [...input.files] } : input;
    const sentFileIds = sentInput.files?.map(({ id }) => id) ?? [];
    const newMessage = reactive(
      createMessageEntity({ ...sentInput, isLoading: true, userId: session.value.data.user.id }),
    );
    // A rejected Create hook (e.g. the attachment URL fetch) strands the optimistic loading bubble in the list,
    // So roll the entity back out before surfacing the failure — nothing has reached the server yet. Through the
    // Delete hooks, not a bare list removal: the Create hooks that just ran wrote a download-url entry per
    // Attached file, and the hourly re-mint sweep would keep re-signing urls for a message that never existed
    const isOptimisticCreated = await getResultAsync(() => storeCreateMessage(newMessage, true)).match(
      () => true,
      async (error) => {
        await storeDeleteMessage(newMessage);
        if (!getIsAlertedByErrorLink(error)) createAlert(error.message, "error");
        return false;
      },
    );
    if (!isOptimisticCreated) return false;
    await onOptimisticCreate?.(sentFileIds);

    return getResultAsync(() => $trpc.message.createMessage.mutate(sentInput)).match(
      async (createdMessage) => {
        Object.assign(newMessage, createdMessage);
        delete newMessage.isLoading;
        // The server has the message, so the attachments held since the bubble are dropped for good — with them
        // Go the grants that authorize reclaiming their blobs, which only a rejection could have needed back
        await MessageHookMap.CommitSend.run(sentInput.roomId, sentFileIds);
        // The server auto-follows the thread a reply lands in, so mirror it here — the follow state is loaded
        // Once per room and would otherwise stay stale until a reload, showing Follow for a followed thread.
        // A local array write with nothing fallible in it, so it is called bare; anything genuinely fallible
        // Added here is best-effort, never a rollback — the message already exists on the server
        const { replyRowKey } = input;
        if (replyRowKey) threadFollowStore.storeFollowThread(input.roomId, replyRowKey);
        return true;
      },
      async (error) => {
        // The mutation spans the server commit, so nothing here may roll the bubble back out: a rejection can
        // Just as well be a lost response for a message that landed, and deleting it then hides a sent message
        // From its own sender (the subscription echo is filtered for the sending session, so nothing restores
        // It) and invites the duplicate resend /docs/architecture/persist-then-notify exists to prevent. The
        // Bubble also stays the sender's copy of a genuinely rejected message — the composer is already reset —
        // So it holds its loading state and the alert says what happened. Only when errorLink has not already
        // Said it: a rejected send is characteristically one of the codes it owns (slowmode, a Zod rejection),
        // And alerting again puts two identical toasts on screen for one send.
        // The composer's attachments come back, held rather than discarded since the bubble — so the user retries
        // With the files already uploaded instead of re-picking them, and their grants can still reclaim the
        // Blobs. The cost is the lost-response case: a message that did land keeps a composer copy whose delete
        // Affordance would reclaim blobs it is still using. That trades a rare broken attachment the user chose
        // Against a certain leak plus lost work on every deterministic rejection, which is what slowmode and the
        // Word filter are
        await MessageHookMap.RollbackSend.run(sentInput.roomId, sentFileIds);
        if (!getIsAlertedByErrorLink(error)) createAlert(error.message, "error");
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
    // The reset runs behind the optimistic bubble, never ahead of the send: it clears the editor and the reply
    // Target, so a send that fails before the bubble exists would take the text the user just typed with it.
    // The attachments leave the composer here too, but only held — they are dropped on `CommitSend` once the
    // Server has accepted the message, and handed back on `RollbackSend` if it rejects
    if (await createMessage(input, (sentFileIds) => MessageHookMap.ResetSend.run(input.roomId, sentFileIds, editor)))
      clearDraft(input.roomId);
  };
  MessageHookMap.ResetSend.register((_roomId, _fileIds, editor) => {
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
