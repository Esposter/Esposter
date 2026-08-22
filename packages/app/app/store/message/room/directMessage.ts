import type { HideDirectMessageInput } from "#shared/models/db/room/HideDirectMessageInput";
import type { RoomInMessage, User } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { useMutation } from "@/composables/shared/useMutation";
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
  const directMessages = computed(() => items.value.toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)));
  const directMessageParticipantsMap = ref(new Map<string, User[]>());
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
          const currentParticipants = directMessageParticipantsMap.value.get(roomId) ?? [];
          const removedIndex = currentParticipants.findIndex(({ id }) => id === userId);
          const removedParticipant = currentParticipants[removedIndex];
          // The participants that followed it, so a rollback can anchor to whichever of them is still there —
          // An index cannot, because a removal that overlapped this one has shifted someone else into that slot
          const followingIds = new Set(currentParticipants.slice(removedIndex + 1).map(({ id }) => id));
          directMessageParticipantsMap.value.set(
            roomId,
            currentParticipants.filter(({ id }) => id !== userId),
          );
          return () => {
            if (!removedParticipant) return;
            // Restore only this participant, ahead of the first one that still follows it. Reinstating a
            // Whole-list snapshot would re-add anyone a removal that overlapped this one had already taken out
            const participantsNow = directMessageParticipantsMap.value.get(roomId) ?? [];
            const followingIndex = participantsNow.findIndex(({ id }) => followingIds.has(id));
            directMessageParticipantsMap.value.set(
              roomId,
              participantsNow.toSpliced(
                followingIndex === -1 ? participantsNow.length : followingIndex,
                0,
                removedParticipant,
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
    directMessageParticipantsMap,
    directMessages,
    hideDirectMessage,
    storeDeleteDirectMessage,
    storeUpdateDirectMessage,
    ...restOperationData,
    ...restData,
  };
});
