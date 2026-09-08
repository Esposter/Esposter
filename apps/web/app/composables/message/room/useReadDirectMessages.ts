import type { RoomInMessage } from "@esposter/db-schema";

import { useDirectMessageStore } from "@/store/message/room/directMessage";

export const useReadDirectMessages = () => {
  const { $trpc } = useNuxtApp();
  const directMessageStore = useDirectMessageStore();
  const { readItems, readMoreItems, storeDirectMessageParticipants } = directMessageStore;
  // A direct message is named after whoever is in it, so every page needs its participants beside it — both
  // Paths that produce one go through here rather than restating the read
  const readParticipants = async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;

    const directMessageParticipants = await $trpc.room.directMessage.readDirectMessageParticipants.query(roomIds);
    for (const { participants, roomId } of directMessageParticipants)
      storeDirectMessageParticipants(roomId, participants);
  };
  const readDirectMessages = () =>
    readItems(async () => {
      const cursorPaginationData = await $trpc.room.directMessage.readDirectMessages.query();
      await readParticipants(cursorPaginationData.items.map(({ id }) => id));
      return cursorPaginationData;
    });
  const readMoreDirectMessages = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const cursorPaginationData = await $trpc.room.directMessage.readDirectMessages.query({ cursor });
      await readParticipants(cursorPaginationData.items.map(({ id }) => id));
      return cursorPaginationData;
    }, onComplete);

  return { readDirectMessages, readMoreDirectMessages };
};
