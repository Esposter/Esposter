import type { DirectMessageParticipant } from "#shared/models/db/room/DirectMessageParticipants";
import type { HideDirectMessageInput } from "#shared/models/db/room/HideDirectMessageInput";
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { authClient } from "#src/services/auth/authClient";
import { createOperationData } from "#src/services/shared/createOperationData";
import { useDataStore } from "#src/store/message/data";
import { useRoomStore } from "#src/store/message/room/index";
import { DerivedDatabaseEntityType, MessageType } from "@esposter/db-schema";
import { getSynchronizedFunction, ID_SEPARATOR, noop, RoutePath, takeOne } from "@esposter/shared";

export const useDirectMessageStore = defineStore("message/room/directMessage", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = useCursorPaginationData<RoomInMessage>();
  const {
    createDirectMessage: storeCreateDirectMessage,
    deleteDirectMessage: storeDeleteDirectMessage,
    updateDirectMessage: storeUpdateDirectMessage,
    ...restOperationData
  } = createOperationData(items, ["id"], DerivedDatabaseEntityType.DirectMessage);
  const directMessages = computed(() =>
    items.value.toSorted(
      (firstDirectMessage, secondDirectMessage) =>
        secondDirectMessage.lastMessageAt.getTime() - firstDirectMessage.lastMessageAt.getTime(),
    ),
  );
  // Keyed by room and read by every surface that names a conversation after the people in it. Held behind its
  // Own accessors rather than handed out: a participant list written directly from every surface that reads it
  // Is a list nothing can state the invariants of
  const directMessageParticipantsMap = ref(new Map<string, DirectMessageParticipant[]>());
  const getDirectMessageParticipants = (roomId: string) => directMessageParticipantsMap.value.get(roomId) ?? [];
  // Every conversation past two people is a group, which the invite dialog lists beside the friends
  const checkIsGroupDirectMessage = (roomId: string) => getDirectMessageParticipants(roomId).length > 1;
  const storeDirectMessageParticipants = (roomId: string, participants: (PublicUser & { displayName?: string })[]) => {
    directMessageParticipantsMap.value.set(
      roomId,
      participants.map((participant) => ({ ...participant, displayName: participant.displayName ?? participant.name })),
    );
  };
  const storeDeleteDirectMessageParticipant = (roomId: string, userId: PublicUser["id"]) => {
    storeDirectMessageParticipants(
      roomId,
      getDirectMessageParticipants(roomId).filter(({ id }) => id !== userId),
    );
  };
  const roomStore = useRoomStore();
  // A direct message is a room, and the route carries one id — so the room store's reading of it is the same
  // Reading this store needs, rather than a second copy of the route parsing that can drift from it
  const currentDirectMessageId = computed(() => roomStore.currentRoomId);
  const currentDirectMessage = computed(() =>
    directMessages.value.find(({ id }) => id === currentDirectMessageId.value),
  );
  const dataStore = useDataStore();
  const { createMessage } = dataStore;
  const { executeMutation: executeCreateDirectMessageMutation } = useMutation();
  const { checkIsPending: checkIsInviteFriendPending, executeMutation: executeInviteFriendMutation } = useMutation();
  const { checkIsPending: checkIsInviteDirectMessagePending, executeMutation: executeInviteDirectMessageMutation } =
    useMutation();
  const { executeMutation: executeDeleteDirectMessageParticipantMutation } = useMutation();
  const { executeMutation: executeHideDirectMessageMutation } = useMutation();
  const { executeMutation: executeLeaveDirectMessageMutation } = useMutation();
  const session = authClient.useSession();
  const createDirectMessage = async (userIds: string[]) => {
    const outcome = await executeCreateDirectMessageMutation(
      () => $trpc.room.directMessage.createDirectMessage.mutate(userIds),
      {
        // The conversation is the server's to name, so it is drawn once the server answers with its room
        awaitedBecause: AwaitedReason.ServerIssuedValue,
        key: Symbol("createDirectMessage"),
        onSuccess: async (room) => {
          const existingDirectMessage = directMessages.value.find(({ id }) => id === room.id);
          if (!existingDirectMessage) storeCreateDirectMessage(room, true);
          await navigateTo(RoutePath.Messages(room.id));
        },
      },
    );
    // Whether the server kept it, so the dialog that asked stays open over a refusal
    return outcome.status === MutationStatus.Succeeded;
  };
  // The link goes into a conversation the reader is already in, so unlike inviteFriend there is no direct message
  // To create first, and the message is the reader's own
  const inviteDirectMessage = (roomId: string, inviteLink: string) => {
    executeInviteDirectMessageMutation(
      () => createMessage({ files: [], message: inviteLink, replyToId: null, roomId, type: MessageType.Message }),
      // The message's bubble is drawn at once by createMessage, which owns its own rollback, so this write applies nothing
      // Of its own. Its key is what the invite's pending state reads
      { applyOptimistic: () => noop, key: roomId },
    );
  };
  // The invite a friend is sent: the direct message is created where none exists, and the reader stays on the
  // Screen they are on, so unlike createDirectMessage this does not navigate. The message is the reader's own
  const inviteFriend = async (friendId: PublicUser["id"], inviteLink: string) => {
    await executeInviteFriendMutation(() => $trpc.room.directMessage.createDirectMessage.mutate([friendId]), {
      // The room the friend's conversation is in is the server's, so the invite is sent once the server names it
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: friendId,
      onSuccess: (room) => {
        const existingDirectMessage = directMessages.value.find(({ id }) => id === room.id);
        if (!existingDirectMessage) storeCreateDirectMessage(room, true);
        inviteDirectMessage(room.id, inviteLink);
      },
    });
  };
  const deleteDirectMessageParticipant = (roomId: string, userId: string) => {
    executeDeleteDirectMessageParticipantMutation(
      () => $trpc.room.directMessage.deleteDirectMessageParticipant.mutate({ roomId, userId }),
      {
        applyOptimistic: () => {
          // Read here rather than before the call, so this reflects whatever a concurrent removal already stored
          const currentParticipants = getDirectMessageParticipants(roomId);
          const deletedIndex = currentParticipants.findIndex(({ id }) => id === userId);
          const deletedParticipant = currentParticipants[deletedIndex];
          // The participants that followed it, so a rollback can anchor to whichever of them is still there —
          // An index cannot, because a removal that overlapped this one has shifted someone else into that slot
          const followingIds = new Set(currentParticipants.slice(deletedIndex + 1).map(({ id }) => id));
          storeDeleteDirectMessageParticipant(roomId, userId);
          return () => {
            if (!deletedParticipant) return;
            // Restore only this participant, ahead of the first one that still follows it
            const participantsNow = getDirectMessageParticipants(roomId);
            const followingIndex = participantsNow.findIndex(({ id }) => followingIds.has(id));
            storeDirectMessageParticipants(
              roomId,
              participantsNow.toSpliced(
                followingIndex === -1 ? participantsNow.length : followingIndex,
                0,
                deletedParticipant,
              ),
            );
          };
        },
        // The target is the room-and-participant pair: the same person can be in more than one direct message,
        // So keying on userId alone would make unrelated rooms' removals queue behind each other
        key: `${roomId}${ID_SEPARATOR}${userId}`,
      },
    );
  };
  // Started rather than awaited: the removal's apply runs the screen steps the write causes as the write is sent
  const navigateToDirectMessage = getSynchronizedFunction(async (path: string) => {
    await navigateTo(path, { replace: true });
  });
  // Hiding and leaving both take the conversation out of the list, and a reader in it is handed to the conversation at
  // The top. A refusal restores only this conversation, since the list is sorted for display, and puts the reader back
  // In it unless they have moved on from where the removal sent them
  const applyOptimisticRemoveDirectMessage = (roomId: string) => {
    const removedDirectMessage = items.value.find(({ id }) => id === roomId);
    const isCurrent = currentDirectMessageId.value === roomId;
    storeDeleteDirectMessage({ id: roomId });
    const landingDirectMessageId = directMessages.value.length > 0 ? takeOne(directMessages.value).id : "";
    if (isCurrent)
      navigateToDirectMessage(
        landingDirectMessageId ? RoutePath.Messages(landingDirectMessageId) : RoutePath.MessagesIndex,
      );
    return () => {
      if (removedDirectMessage) storeCreateDirectMessage(removedDirectMessage);
      if (isCurrent && currentDirectMessageId.value === landingDirectMessageId)
        navigateToDirectMessage(RoutePath.Messages(roomId));
    };
  };
  const hideDirectMessage = (input: HideDirectMessageInput) => {
    executeHideDirectMessageMutation(() => $trpc.room.directMessage.hideDirectMessage.mutate(input), {
      applyOptimistic: () => applyOptimisticRemoveDirectMessage(input),
      // Keyed per room so hiding two conversations in quick succession never queues behind the other
      key: input,
    });
  };
  // Removing yourself is leaving: the participant list never holds the reader, so it is the conversation that goes
  const leaveDirectMessage = (roomId: string) => {
    const userId = session.value.data?.user.id;
    if (!userId) return;
    executeLeaveDirectMessageMutation(
      () => $trpc.room.directMessage.deleteDirectMessageParticipant.mutate({ roomId, userId }),
      { applyOptimistic: () => applyOptimisticRemoveDirectMessage(roomId), key: roomId },
    );
  };

  return {
    checkIsGroupDirectMessage,
    checkIsInviteDirectMessagePending,
    checkIsInviteFriendPending,
    createDirectMessage,
    currentDirectMessage,
    currentDirectMessageId,
    deleteDirectMessageParticipant,
    directMessages,
    getDirectMessageParticipants,
    hideDirectMessage,
    inviteDirectMessage,
    inviteFriend,
    leaveDirectMessage,
    storeDeleteDirectMessage,
    storeDeleteDirectMessageParticipant,
    storeDirectMessageParticipants,
    storeUpdateDirectMessage,
    ...restOperationData,
    ...restData,
  };
});
