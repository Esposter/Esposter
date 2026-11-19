import type { DirectMessageParticipants } from "#shared/models/db/room/DirectMessageParticipants";

import { useDirectMessageStore } from "#src/store/message/room/directMessage";

export const useReadDirectMessages = () => {
  const { $trpc } = useNuxtApp();
  const directMessageStore = useDirectMessageStore();
  const { readItems, readMoreItems, storeDirectMessageParticipants } = directMessageStore;
  // A direct message is named after whoever is in it, so every page answers with its participants beside its rows, and
  // Both paths that produce one take them from that answer rather than reading them again
  const storeParticipants = (directMessageParticipants: DirectMessageParticipants[]) => {
    for (const { participants, roomId } of directMessageParticipants)
      storeDirectMessageParticipants(roomId, participants);
  };
  const readDirectMessages = () =>
    readItems(async () => {
      const { participants, ...cursorPaginationData } = await $trpc.room.directMessage.readDirectMessages.query();
      storeParticipants(participants);
      return cursorPaginationData;
    });
  const readMoreDirectMessages = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const { participants, ...cursorPaginationData } = await $trpc.room.directMessage.readDirectMessages.query({
        cursor,
      });
      storeParticipants(participants);
      return cursorPaginationData;
    }, onComplete);

  return { readDirectMessages, readMoreDirectMessages };
};
