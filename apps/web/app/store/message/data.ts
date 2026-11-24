import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
import type { DeleteFileInput } from "#shared/models/db/message/DeleteFileInput";
import type { DeleteLinkPreviewResponseInput } from "#shared/models/db/message/DeleteLinkPreviewResponseInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { PinMessageInput } from "#shared/models/db/message/PinMessageInput";
import type { UnpinMessageInput } from "#shared/models/db/message/UnpinMessageInput";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { VotePollInput } from "#shared/models/db/message/VotePollInput";
import type { MessageEvents } from "#shared/models/message/events/MessageEvents";
import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { ComposerTarget } from "#src/models/message/ComposerTarget";
import type { Page, RoomMessage, Typing } from "@esposter/db-schema";
import type { Editor } from "@tiptap/core";

import { BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS } from "#shared/services/pagination/constants";
import { MessageHook } from "#src/models/message/MessageHook";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { authClient } from "#src/services/auth/authClient";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { messageHolderRegistry } from "#src/services/message/messageHolderRegistry";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { updateMessageCopy } from "#src/services/message/updateMessageCopy";
import { createOperationData } from "#src/services/shared/createOperationData";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useThreadFollowStore } from "#src/store/message/threadFollow";
import { DatabaseEntityType } from "@esposter/db-schema";
import {
  chunk,
  createExponentialBackoff,
  getResultAsync,
  getSynchronizedFunction,
  MAX_READ_LIMIT,
  noop,
  Operation,
  withFinalizerAsync,
} from "@esposter/shared";

// A message id is only unique within its room, so a poll with a vote out is keyed by its room and its id together
const getVotingPollKey = ({ id, roomId }: Pick<ClientMessage, "id" | "roomId">) => `${roomId}:${id}`;

export const useDataStore = defineStore("message/data", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const threadFollowStore = useThreadFollowStore();
  const { refetchFollowedThreads } = threadFollowStore;
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<ClientMessage>(() => roomStore.currentRoomId);
  // `items` is the reading view — the room on screen. Every write names the room it is for, which a message
  // Always carries as its `roomId`: a subscription echo, a rejected edit's rollback and an attachment
  // Removal all belong to the room the message is in, whichever room the reader has moved to since
  const getRoomOperationData = (roomId: ClientMessage["roomId"]) =>
    createOperationData(getSlice(roomId).items, ["id"], DatabaseEntityType.Message);
  // The newer side of the list is one cursor per room, the one the server answered for it, keyed by room like the rows
  // It pages: a deep link into a room leaves a cursor behind, and a global one would still point at that room's window
  // After the switch, so the next room renders a "load newer" waypoint it never earned. Every write of it happens after
  // An await, so the ambient value is a reading view the waypoint renders, and a writer is obtained by naming a room
  const { data: ambientPreviousCursor, getDataRef: getPreviousCursorRef } = useDataMap(
    () => roomStore.currentRoomId,
    "",
  );
  const previousCursor = computed(() => ambientPreviousCursor.value);
  const online = useOnline();
  // The waypoint re-arms on completion even when a newer page fails, so retries are paced the way the older side paces
  // Them
  const executeNewerWithBackoff = createExponentialBackoff(BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS);
  // Reads the newer side of a room's list from the cursor the room holds, and places its page ahead of the rows it has.
  // A page is held only while the cursor it was read from is still the room's: a newer read or a fresh load that
  // Replaced that chain leaves its page belonging to a window the list no longer holds, so it is dropped
  const readMoreNewerItems = (
    roomId: ClientMessage["roomId"],
    query: (cursor: string) => Promise<Page<ClientMessage>>,
    onComplete?: () => void,
  ) => {
    const boundPreviousCursor = getPreviousCursorRef(roomId);
    const { items: roomItems } = getSlice(roomId);
    return withFinalizerAsync(async () => {
      if (!online.value) return;

      const issuedCursor = boundPreviousCursor.value;
      const newerPage = await executeNewerWithBackoff(() => query(issuedCursor));
      if (boundPreviousCursor.value !== issuedCursor) return;

      const newerIds = new Set(newerPage.items.map(({ id }) => id));
      roomItems.value = [...newerPage.items, ...roomItems.value.filter(({ id }) => !newerIds.has(id))];
      boundPreviousCursor.value = newerPage.nextCursor;
    }, onComplete);
  };
  // The one field here that is not keyed by room, deliberately: a typing indicator expires after three seconds,
  // So a per-room slice would only ever hold entries that have already lapsed. The subscription owns it instead —
  // Its teardown empties this as it unsubscribes, so the list always describes the room currently subscribed
  const typings = ref<Typing[]>([]);
  // `onOptimisticCreate` runs once the bubble is in the list and before anything reaches the server — the
  // Composer reset hangs off it rather than off the send, because the bubble is the sender's only copy of what
  // They typed once the editor is cleared. It is handed the attachments this send took, so the composer stops
  // Offering them to the next Enter while it waits for `CommitSend` to drop them for good
  const createMessage = async (
    input: CreateMessageInput,
    onOptimisticCreate?: (sentFileIds: string[]) => Promise<void>,
    // Whose attachments this send took, so the commit and the rollback reach the composer that is holding them
    target: ComposerTarget = { roomId: input.roomId, threadRootId: 0 },
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
    const newMessage: ClientMessage = reactive({
      ...createOptimisticMessage(sentInput, session.value.data.user.id),
      isLoading: true,
    });
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

    return getResultAsync(() =>
      $trpc.message.createMessage.mutate({ ...sentInput, timeZone: Temporal.Now.timeZoneId() }),
    ).match(
      async (createdMessage) => {
        Object.assign(newMessage, createdMessage);
        delete newMessage.isLoading;
        // The server has the message, so the attachments held since the bubble are dropped for good — with them
        // Go the grants that authorize reclaiming their blobs, which only a rejection could have needed back
        await MessageHookMap[MessageHook.CommitSend].run(target, sentFileIds);
        // The server auto-follows the thread a reply lands in, so the room's follows are read again — the follow state
        // Is loaded once per room and would otherwise stay stale until a reload, showing Follow for a followed thread.
        // Best-effort, since the message already exists on the server and a failed read of the follows is no reason to
        // Fail the send
        const { replyToId } = input;
        if (replyToId) await getResultAsync(() => refetchFollowedThreads(input.roomId)).match(noop, console.error);
        return true;
      },
      async (error) => {
        // The mutation spans the server commit, so nothing here may roll the bubble back out: a rejection can
        // Just as well be a lost response for a message that landed, and deleting it then hides a sent message
        // From its own sender (the subscription echo is filtered for the sending session, so nothing restores
        // It) and invites the duplicate resend openspec/specs/architecture/persist-then-notify/design.md exists
        // To prevent. The bubble also stays the sender's copy of a genuinely rejected message — the composer is already
        // Reset —
        // So it holds its loading state and the alert says what happened.
        // The composer's attachments come back, held rather than discarded since the bubble — so the user retries
        // With the files already uploaded instead of re-picking them, and their grants can still reclaim the
        // Blobs. The cost is the lost-response case: a message that did land keeps a composer copy whose delete
        // Affordance would reclaim blobs it is still using. That trades a rare broken attachment the user chose
        // Against a certain leak plus lost work on every deterministic rejection, which is what slowmode and the
        // Word filter are
        await MessageHookMap[MessageHook.RollbackSend].run(target, sentFileIds);
        createErrorAlert(error);
        return false;
      },
    );
  };
  // An edit, an attachment removal and a poll vote are awaited. The room object decides the row it stores: the members
  // The new text names, the time of the edit, the files it keeps and the version that orders it. The object sends each
  // Change to every socket but this device's own, so the answer is the only copy this device gets, and it goes through
  // The funnel the room's event goes through, so every copy of the message takes it. A refused write changes nothing on
  // Screen, and the alert says why
  const awaitMessageAnswer = (write: () => Promise<RoomMessage>, roomId: ClientMessage["roomId"]) =>
    getResultAsync(write).match(
      async (updatedMessage) => {
        await storeUpdateMessage({ ...updatedMessage, roomId });
        return true;
      },
      (error) => {
        createErrorAlert(error);
        return false;
      },
    );
  const updateMessage = (input: UpdateMessageInput) =>
    awaitMessageAnswer(() => $trpc.message.updateMessage.mutate(input), input.roomId);
  const deleteFile = ({ fileId, ...messageKey }: DeleteFileInput) =>
    awaitMessageAnswer(() => $trpc.message.deleteFile.mutate({ fileId, ...messageKey }), messageKey.roomId);
  // A pin, an unpin and a link preview removal each change the message the room holds, and the room answers with it, so
  // The answer is drawn through the same funnel
  const pinMessage = (input: PinMessageInput) =>
    awaitMessageAnswer(() => $trpc.message.pinMessage.mutate(input), input.roomId);
  const unpinMessage = (input: UnpinMessageInput) =>
    awaitMessageAnswer(() => $trpc.message.unpinMessage.mutate(input), input.roomId);
  const deleteLinkPreviewResponse = (input: DeleteLinkPreviewResponseInput) =>
    awaitMessageAnswer(() => $trpc.message.deleteLinkPreviewResponse.mutate(input), input.roomId);
  // A deletion carries no version to order it, so the message leaves the list when the room answers the removal
  const deleteMessage = (input: DeleteMessageInput) =>
    getResultAsync(() => $trpc.message.deleteMessage.mutate(input)).match(
      async () => {
        await storeDeleteMessage(input);
        return true;
      },
      (error) => {
        createErrorAlert(error);
        return false;
      },
    );
  // The polls with a vote out. A second vote on one poll is not sent while the first is, and the poll's radio group
  // Reads its own key only
  const { checkIsPending, executeMutation } = useMutation();
  const checkIsVotePending = (message: ClientMessage) => checkIsPending(getVotingPollKey(message));
  const votePoll = (input: VotePollInput) =>
    executeMutation(() => awaitMessageAnswer(() => $trpc.message.votePoll.mutate(input), input.roomId), {
      awaitedBecause: AwaitedReason.ServerDecidedOutcome,
      isExclusive: true,
      key: getVotingPollKey(input),
    });
  // The sender's own message is pushed first (our list is reversed — most recent at the front) so the bubble
  // Renders immediately in its loading state, THEN the Create hooks run: one of them fetches attachment download
  // Urls over the network, and running it before the push would gate the "optimistic" render behind a round trip.
  // A message arriving from anyone else has no bubble to keep responsive and nothing to roll back, so it waits for
  // Its urls — pushing it first renders every incoming attachment as a broken image until the fetch lands
  const storeCreateMessage = async (message: ClientMessage, isOptimistic = false) => {
    const { createMessage: baseStoreCreateMessage } = getRoomOperationData(message.roomId);
    if (isOptimistic) {
      baseStoreCreateMessage(message, true);
      await MessageHookMap[Operation.Create].run(message);
    } else {
      await MessageHookMap[Operation.Create].run(message);
      baseStoreCreateMessage(message, true);
    }
  };
  // Every copy of a message the client holds for a room: the window's, and each holder's. An arrival is judged against
  // All of them, since a thread pane holds replies the window does not
  const listHeldMessages = (roomId: ClientMessage["roomId"]) => {
    const heldMessages = [...getSlice(roomId).items.value];
    for (const holder of messageHolderRegistry.hooks)
      holder(roomId, (messages) => {
        heldMessages.push(...messages);
      });
    return heldMessages;
  };
  // The hooks take the update into each holder's copy, and the window's copy last, each through `updateMessageCopy`. So
  // The answer to a write and the room's echo of the same change, which name the same version, land once and change
  // Nothing the second time, and an older answer that lands last loses to each copy already newer than it
  const storeUpdateMessage = async (input: MessageEvents["updateMessage"][0][0]) => {
    await MessageHookMap[Operation.Update].run(input);
    updateMessageCopy(
      getSlice(input.roomId).items.value.find(({ id }) => id === input.id),
      input,
    );
  };
  const storeDeleteMessage = async (input: DeleteMessageInput) => {
    const { deleteMessage: baseStoreDeleteMessage } = getRoomOperationData(input.roomId);
    await MessageHookMap[Operation.Delete].run(input);
    baseStoreDeleteMessage(input);
  };
  // A reconnect replays the messages it missed but not the edits or deletes, so every message the client holds is read
  // Again by id: the loaded window and each row a store keeps beside it. A row the room does not return is a deletion
  // The closed socket missed. Every other row goes through the same funnel its live event would have, which applies it
  // By its version: every copy is written at once or none is, so a row already at a copy's version changes nothing
  const refreshLoadedMessages = getSynchronizedFunction((roomId: ClientMessage["roomId"]) =>
    getResultAsync(async () => {
      const heldIds = new Set(
        listHeldMessages(roomId)
          .filter(({ isLoading }) => !isLoading)
          .map(({ id }) => id),
      );
      if (heldIds.size === 0) return;

      // The held rows can name more messages than one read takes, so the ids go out in chunks of its cap, all at once,
      // And the answers are merged once every chunk is in
      const liveMessages = (
        await Promise.all(
          chunk([...heldIds], MAX_READ_LIMIT).map((messageIds) =>
            $trpc.message.readMessagesByIds.query({ messageIds, roomId }),
          ),
        )
      ).flat();
      const liveMessageMap = new Map(liveMessages.map((message) => [message.id, message]));
      await Promise.all(
        Array.from(heldIds, async (messageId) => {
          const liveMessage = liveMessageMap.get(messageId);
          if (liveMessage) await storeUpdateMessage({ ...liveMessage, roomId });
          else await storeDeleteMessage({ id: messageId, roomId });
        }),
      );
    }).match(noop, console.error),
  );

  const sendMessage = async (
    input: CreateMessageInput,
    editor?: Editor,
    // Everything that composes outside a composer — a slash command, a poll, a draft sent from the drafts page —
    // Is the room's own send, and its reset finds nothing of the thread pane's to clear
    target: ComposerTarget = { roomId: input.roomId, threadRootId: 0 },
    // A send that takes text no editor holds (a draft sent from the drafts page) clears that text here, behind the
    // Bubble for the same reason the reset does
    onOptimisticCreate?: () => Promise<void> | void,
  ) => {
    // The reset runs behind the optimistic bubble, never ahead of the send: it clears the editor and the reply
    // Target, so a send that fails before the bubble exists would take the text the user just typed with it.
    // The attachments leave the composer here too, but only held — they are dropped on `CommitSend` once the
    // Server has accepted the message, and handed back on `RollbackSend` if it rejects. The acknowledgement clears
    // Nothing: the reset is the one clear of the text that was sent, while text typed during the round trip, or text
    // A command never sent, stays in the composer — clearing the input now would leave the editor showing text the
    // Store no longer holds
    await createMessage(
      input,
      async (sentFileIds) => {
        await MessageHookMap[MessageHook.ResetSend].run(target, sentFileIds, editor);
        await onOptimisticCreate?.();
      },
      target,
    );
  };
  MessageHookMap[MessageHook.ResetSend].register((_target, _fileIds, editor) => {
    editor?.commands.clearContent(true);
  });
  // Only expose the internal store CRUD functions for subscriptions; everything else directly calls
  // The $trpc mutations, tracked by their related subscriptions.
  return {
    checkIsVotePending,
    createMessage,
    deleteFile,
    deleteLinkPreviewResponse,
    deleteMessage,
    getPreviousCursorRef,
    getSlice,
    items,
    pinMessage,
    previousCursor,
    readMoreNewerItems,
    refreshLoadedMessages,
    sendMessage,
    storeCreateMessage,
    storeDeleteMessage,
    storeUpdateMessage,
    unpinMessage,
    updateMessage,
    votePoll,
    ...restData,
    typings,
  };
});
