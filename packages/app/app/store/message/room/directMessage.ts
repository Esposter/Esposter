import type { HideDirectMessageInput } from "#shared/models/db/room/HideDirectMessageInput";
import type { RoomInMessage, User } from "@esposter/db-schema";

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
  // Own accessors rather than handed out: six call sites outside this store used to write it directly, and a
  // Participant list edited from five places is a list nothing can state the invariants of
  const directMessageParticipantsMap = ref(new Map<string, User[]>());
  const getDirectMessageParticipants = (roomId: string) => directMessageParticipantsMap.value.get(roomId) ?? [];
  const storeDirectMessageParticipants = (roomId: string, participants: User[]) => {
    directMessageParticipantsMap.value.set(roomId, participants);
  };
  // A join is delivered for every conversation the reader is in, so it names its own room. Idempotent, because
  // The same join can arrive twice — a reconnect replays it against a list the read already carried
  const storeCreateDirectMessageParticipant = (roomId: string, participant: User) => {
    const participants = getDirectMessageParticipants(roomId);
    if (participants.some(({ id }) => id === participant.id)) return;

    storeDirectMessageParticipants(roomId, [participant, ...participants]);
  };
  const storeDeleteDirectMessageParticipant = (roomId: string, userId: User["id"]) => {
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
  const createDirectMessage = async (userIds: string[]) => {
    // Server-generated room — non-optimistic, applied in onSuccess. Creates have no natural entity key,
    // So each call gets a unique one — overlapping creates must never queue behind each other
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
            // Restore only this participant, ahead of the first one that still follows it. Reinstating a
            // Whole-list snapshot would re-add anyone a removal that overlapped this one had already taken out
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
  const hideDirectMessage = async (input: HideDirectMessageInput) => {
    await executeHideDirectMessageMutation(() => $trpc.room.directMessage.hideDirectMessage.mutate(input), {
      // Restore only this conversation. Reinstating a whole-list snapshot would un-hide one another call already
      // Hid and drop whatever arrived while this write was in flight — and the list is sorted for display, so
      // Where the restored conversation lands in it is not observable
      applyOptimistic: () => {
        const hiddenDirectMessage = items.value.find(({ id }) => id === input);
        storeDeleteDirectMessage({ id: input });
        return () => {
          if (hiddenDirectMessage) storeCreateDirectMessage(hiddenDirectMessage);
        };
      },
      // Keyed per room so hiding two conversations in quick succession never queues behind the other
      key: input,
      onSuccess: async () => {
        if (currentDirectMessageId.value !== input) return;
        // Read once the hide has landed, so the conversation the user is handed to is one that is still there
        await navigateTo(
          directMessages.value.length > 0
            ? RoutePath.Messages(takeOne(directMessages.value).id)
            : RoutePath.MessagesIndex,
          { replace: true },
        );
      },
    });
  };

  return {
    createDirectMessage,
    currentDirectMessage,
    currentDirectMessageId,
    deleteDirectMessageParticipant,
    directMessages,
    getDirectMessageParticipants,
    hideDirectMessage,
    storeCreateDirectMessageParticipant,
    storeDeleteDirectMessage,
    storeDeleteDirectMessageParticipant,
    storeDirectMessageParticipants,
    storeUpdateDirectMessage,
    ...restOperationData,
    ...restData,
  };
});
