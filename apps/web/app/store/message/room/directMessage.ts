import type { HideDirectMessageInput } from "#shared/models/db/room/HideDirectMessageInput";
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DerivedDatabaseEntityType } from "@esposter/db-schema";
import { ID_SEPARATOR, RoutePath, takeOne } from "@esposter/shared";

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
        secondDirectMessage.updatedAt.getTime() - firstDirectMessage.updatedAt.getTime(),
    ),
  );
  // Keyed by room and read by every surface that names a conversation after the people in it. Held behind its
  // Own accessors rather than handed out: a participant list written directly from every surface that reads it
  // Is a list nothing can state the invariants of
  const directMessageParticipantsMap = ref(new Map<string, PublicUser[]>());
  const getDirectMessageParticipants = (roomId: string) => directMessageParticipantsMap.value.get(roomId) ?? [];
  const storeDirectMessageParticipants = (roomId: string, participants: PublicUser[]) => {
    directMessageParticipantsMap.value.set(roomId, participants);
  };
  // A join is delivered for every conversation the reader is in, so it names its own room. Idempotent, because
  // The same join can arrive twice — a reconnect replays it against a list the read already carried
  const storeCreateDirectMessageParticipant = (roomId: string, participant: PublicUser) => {
    const participants = getDirectMessageParticipants(roomId);
    if (participants.some(({ id }) => id === participant.id)) return;

    storeDirectMessageParticipants(roomId, [participant, ...participants]);
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
  const { executeMutation: executeCreateDirectMessageMutation } = useMutation();
  const { executeMutation: executeDeleteDirectMessageParticipantMutation } = useMutation();
  const { executeMutation: executeHideDirectMessageMutation } = useMutation();
  const { executeMutation: executeLeaveDirectMessageMutation } = useMutation();
  const session = authClient.useSession();
  const createDirectMessage = async (userIds: string[]) => {
    await executeCreateDirectMessageMutation(() => $trpc.room.directMessage.createDirectMessage.mutate(userIds), {
      key: Symbol("createDirectMessage"),
      onSuccess: async (room) => {
        const existingDirectMessage = directMessages.value.find(({ id }) => id === room.id);
        if (!existingDirectMessage) storeCreateDirectMessage(room, true);
        await navigateTo(RoutePath.Messages(room.id));
      },
    });
  };
  const deleteDirectMessageParticipant = async (roomId: string, userId: string) => {
    await executeDeleteDirectMessageParticipantMutation(
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
  // Hiding and leaving both take the conversation out of the list. Restore only this conversation: the list is
  // Sorted for display, so where it lands in it is not observable
  const applyOptimisticRemoveDirectMessage = (roomId: string) => {
    const removedDirectMessage = items.value.find(({ id }) => id === roomId);
    storeDeleteDirectMessage({ id: roomId });
    return () => {
      if (removedDirectMessage) storeCreateDirectMessage(removedDirectMessage);
    };
  };
  // Read once the removal has landed, so the conversation the user is handed to is one that is still there
  const navigateFromRemovedDirectMessage = async (roomId: string) => {
    if (currentDirectMessageId.value !== roomId) return;
    await navigateTo(
      directMessages.value.length > 0 ? RoutePath.Messages(takeOne(directMessages.value).id) : RoutePath.MessagesIndex,
      { replace: true },
    );
  };
  const hideDirectMessage = async (input: HideDirectMessageInput) => {
    await executeHideDirectMessageMutation(() => $trpc.room.directMessage.hideDirectMessage.mutate(input), {
      applyOptimistic: () => applyOptimisticRemoveDirectMessage(input),
      // Keyed per room so hiding two conversations in quick succession never queues behind the other
      key: input,
      onSuccess: () => navigateFromRemovedDirectMessage(input),
    });
  };
  // Removing yourself is leaving: the participant list never holds the reader, so it is the conversation that goes
  const leaveDirectMessage = async (roomId: string) => {
    const userId = session.value.data?.user.id;
    if (!userId) return;
    await executeLeaveDirectMessageMutation(
      () => $trpc.room.directMessage.deleteDirectMessageParticipant.mutate({ roomId, userId }),
      {
        applyOptimistic: () => applyOptimisticRemoveDirectMessage(roomId),
        key: roomId,
        onSuccess: () => navigateFromRemovedDirectMessage(roomId),
      },
    );
  };

  return {
    createDirectMessage,
    currentDirectMessage,
    currentDirectMessageId,
    deleteDirectMessageParticipant,
    directMessages,
    getDirectMessageParticipants,
    hideDirectMessage,
    leaveDirectMessage,
    storeCreateDirectMessageParticipant,
    storeDeleteDirectMessage,
    storeDeleteDirectMessageParticipant,
    storeDirectMessageParticipants,
    storeUpdateDirectMessage,
    ...restOperationData,
    ...restData,
  };
});
