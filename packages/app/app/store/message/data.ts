import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteFileInput } from "#shared/models/db/message/DeleteFileInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { MessageEvents } from "#shared/models/message/events/MessageEvents";
import type { ComposerTarget } from "@/models/message/ComposerTarget";
import type { MessageEntity, StandardCreateMessageInput } from "@esposter/db-schema";
import type { Editor } from "@tiptap/core";

import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { authClient } from "@/services/auth/authClient";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
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
  const roomStore = useRoomStore();
  const threadFollowStore = useThreadFollowStore();
  const { storeFollowThread } = threadFollowStore;
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<MessageEntity>(() => roomStore.currentRoomId);
  // `items` is the reading view — the room on screen. Every write names the room it is for, which a message
  // Always carries as its partition key: a subscription echo, a rejected edit's rollback and an attachment
  // Removal all belong to the room the message is in, whichever room the reader has moved to since
  const getRoomOperationData = (roomId: MessageEntity["partitionKey"]) =>
    createOperationData(getSlice(roomId).items, CompositeAzureKeyPath, AzureEntityType.Message);
  const files = computed(() => items.value.flatMap(({ files: messageFiles }) => messageFiles));
  // Keyed by room like the list they page, never global: a deep link into a room leaves a newer-cursor behind,
  // And a global one would still be pointing at that room's window after the switch — so the next room renders
  // A "load newer" waypoint it never earned and pages in a window cut from another room's timestamps
  // The newer-page cursor belongs to its room exactly as the rows do, and every write of it happens after an
  // Await — so the ambient pair is a reading view the waypoint renders, and a writer is obtained by naming a room
  const { data: ambientHasMoreNewer, getDataRef: getHasMoreNewerRef } = useDataMap(
    () => roomStore.currentRoomId,
    false,
  );
  const { data: ambientNextCursorNewer, getDataRef: getNextCursorNewerRef } = useDataMap(
    () => roomStore.currentRoomId,
    "",
  );
  const hasMoreNewer = computed(() => ambientHasMoreNewer.value);
  const nextCursorNewer = computed(() => ambientNextCursorNewer.value);
  // The one field here that is not keyed by room, deliberately: a typing indicator expires after three seconds,
  // So a per-room slice would only ever hold entries that have already lapsed. The subscription owns it instead —
  // Its teardown empties this as it unsubscribes, so the list always describes the room currently subscribed
  const typings = ref<CreateTypingInput[]>([]);
  // `onOptimisticCreate` runs once the bubble is in the list and before anything reaches the server — the
  // Composer reset hangs off it rather than off the send, because the bubble is the sender's only copy of what
  // They typed once the editor is cleared. It is handed the attachments this send took, so the composer stops
  // Offering them to the next Enter while it waits for `CommitSend` to drop them for good
  const createMessage = async (
    input: StandardCreateMessageInput,
    onOptimisticCreate?: (sentFileIds: string[]) => Promise<void>,
    // Whose attachments this send took, so the commit and the rollback reach the composer that is holding them
    target: ComposerTarget = { roomId: input.roomId, threadRootRowKey: "" },
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
        createErrorAlert(error);
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
        await MessageHookMap.CommitSend.run(target, sentFileIds);
        // The server auto-follows the thread a reply lands in, so mirror it here — the follow state is loaded
        // Once per room and would otherwise stay stale until a reload, showing Follow for a followed thread.
        // A local array write with nothing fallible in it, so it is called bare; anything genuinely fallible
        // Added here is best-effort, never a rollback — the message already exists on the server
        const { replyRowKey } = input;
        if (replyRowKey) storeFollowThread(input.roomId, replyRowKey);
        return true;
      },
      async (error) => {
        // The mutation spans the server commit, so nothing here may roll the bubble back out: a rejection can
        // Just as well be a lost response for a message that landed, and deleting it then hides a sent message
        // From its own sender (the subscription echo is filtered for the sending session, so nothing restores
        // It) and invites the duplicate resend /docs/architecture/persist-then-notify exists to prevent. The
        // Bubble also stays the sender's copy of a genuinely rejected message — the composer is already reset —
        // So it holds its loading state and the alert says what happened.
        // The composer's attachments come back, held rather than discarded since the bubble — so the user retries
        // With the files already uploaded instead of re-picking them, and their grants can still reclaim the
        // Blobs. The cost is the lost-response case: a message that did land keeps a composer copy whose delete
        // Affordance would reclaim blobs it is still using. That trades a rare broken attachment the user chose
        // Against a certain leak plus lost work on every deterministic rejection, which is what slowmode and the
        // Word filter are
        await MessageHookMap.RollbackSend.run(target, sentFileIds);
        createErrorAlert(error);
        return false;
      },
    );
  };
  const updateMessage = async (input: UpdateMessageInput) => {
    const { items: roomItems } = getSlice(input.partitionKey);
    const { updateMessage: baseStoreUpdateMessage } = getRoomOperationData(input.partitionKey);
    await executeMutation(() => $trpc.message.updateMessage.mutate(input), {
      // Apply only the raw reactive field change — the subscription echo re-runs MessageHookMap on success,
      // So calling storeUpdateMessage here would double-fire the update hooks. Read as the write is sent, so a
      // Rejected edit restores the body the edit ahead of it stored rather than the one on screen at the click
      applyOptimistic: () => {
        const previousMessage = roomItems.value.find(getEntityIdEqualComparator(CompositeAzureKeyPath, input))?.message;
        baseStoreUpdateMessage(input);
        return () => {
          if (previousMessage !== undefined) baseStoreUpdateMessage({ ...input, message: previousMessage });
        };
      },
      // `deleteFile` writes through this same executor, so the key is what stops an edit queueing behind an
      // Unrelated attachment removal
      key: input.rowKey,
    });
  };
  const deleteFile = async ({ id, ...compositeKey }: DeleteFileInput) => {
    const { items: roomItems } = getSlice(compositeKey.partitionKey);
    const { updateMessage: baseStoreUpdateMessage } = getRoomOperationData(compositeKey.partitionKey);
    const message = roomItems.value.find(getEntityIdEqualComparator(CompositeAzureKeyPath, compositeKey));
    if (!message) return;

    await executeMutation(() => $trpc.message.deleteFile.mutate({ id, ...compositeKey }), {
      // Apply only the raw reactive change — the subscription echo re-runs MessageHookMap on success. Read as the
      // Write is sent and unwound one attachment at a time: reinstating the list this call was issued with would
      // Resurrect a file a concurrent deletion already removed and drop whatever arrived while it was in flight
      applyOptimistic: () => {
        const deletedFile = message.files.find((file) => file.id === id);
        baseStoreUpdateMessage({ ...compositeKey, files: message.files.filter((file) => file.id !== id) });
        return () => {
          if (!deletedFile) return;

          baseStoreUpdateMessage({ ...compositeKey, files: [...message.files, deletedFile] });
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
    const { createMessage: baseStoreCreateMessage } = getRoomOperationData(message.partitionKey);
    if (isOptimistic) {
      baseStoreCreateMessage(message, true);
      await MessageHookMap[Operation.Create].run(message);
    } else {
      await MessageHookMap[Operation.Create].run(message);
      baseStoreCreateMessage(message, true);
    }
  };
  const storeUpdateMessage = async (input: MessageEvents["updateMessage"][0][0]) => {
    const { updateMessage: baseStoreUpdateMessage } = getRoomOperationData(input.partitionKey);
    await MessageHookMap[Operation.Update].run(input);
    baseStoreUpdateMessage(input);
  };
  const storeDeleteMessage = async (input: DeleteMessageInput) => {
    const { deleteMessage: baseStoreDeleteMessage } = getRoomOperationData(input.partitionKey);
    await MessageHookMap[Operation.Delete].run(input);
    baseStoreDeleteMessage(input);
  };

  const inputStore = useInputStore();
  const { checkIsInputValid, clearComposer, getComposerInput } = inputStore;
  const uploadFileStore = useUploadFileStore();
  const { getComposerFiles } = uploadFileStore;
  const replyStore = useReplyStore();
  // One send for both composers: the room's own, and the thread pane's, which differ only in whose text and
  // Attachments they take and in what the reply points at. A pane send always replies to the thread root — that
  // Is what puts it in the thread rather than merely in the room — where the room composer replies to whatever
  // The user last picked Reply on, if anything
  const sendComposerMessage = async (editor: Editor, target: ComposerTarget) => {
    const { roomId, threadRootRowKey } = target;
    if (!roomId || !checkIsInputValid(target, editor, true)) return;

    const input: StandardCreateMessageInput = {
      files: getComposerFiles(target),
      message: getComposerInput(target),
      replyRowKey: threadRootRowKey || replyStore.rowKey,
      roomId,
      type: MessageType.Message,
    };
    await sendMessage(input, editor, target);
  };
  const sendMessage = async (
    input: StandardCreateMessageInput,
    editor?: Editor,
    // Everything that composes outside a composer — a slash command, a poll, a draft sent from the drafts page —
    // Is the room's own send, and its reset finds nothing of the thread pane's to clear
    target: ComposerTarget = { roomId: input.roomId, threadRootRowKey: "" },
  ) => {
    // The reset runs behind the optimistic bubble, never ahead of the send: it clears the editor and the reply
    // Target, so a send that fails before the bubble exists would take the text the user just typed with it.
    // The attachments leave the composer here too, but only held — they are dropped on `CommitSend` once the
    // Server has accepted the message, and handed back on `RollbackSend` if it rejects
    if (await createMessage(input, (sentFileIds) => MessageHookMap.ResetSend.run(target, sentFileIds, editor), target))
      clearComposer(target);
  };
  MessageHookMap.ResetSend.register((_target, _fileIds, editor) => {
    editor?.commands.clearContent(true);
  });
  // Only expose the internal store CRUD functions for subscriptions; everything else directly calls
  // The $trpc mutations, tracked by their related subscriptions.
  return {
    createMessage,
    deleteFile,
    files,
    getHasMoreNewerRef,
    getNextCursorNewerRef,
    getSlice,
    hasMoreNewer,
    items,
    nextCursorNewer,
    sendComposerMessage,
    sendMessage,
    storeCreateMessage,
    storeDeleteMessage,
    storeUpdateMessage,
    updateMessage,
    ...restData,
    typings,
  };
});
