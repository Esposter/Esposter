import { useDirectMessageStore } from "@/store/message/room/directMessage";

export const useReadDirectMessages = () => {
  const { $trpc } = useNuxtApp();
  const directMessageStore = useDirectMessageStore();
  const { readItems, readMoreItems, storeDirectMessageParticipants } = directMessageStore;

  const readDirectMessages = () =>
    readItems(async () => {
      const cursorPaginationData = await $trpc.room.directMessage.readDirectMessages.query();
      if (cursorPaginationData.items.length > 0) {
        const directMessageParticipants = await $trpc.room.directMessage.readDirectMessageParticipants.query(
          cursorPaginationData.items.map(({ id }) => id),
        );
        for (const { participants, roomId } of directMessageParticipants)
          storeDirectMessageParticipants(roomId, participants);
      }
      return cursorPaginationData;
    });

  const readMoreDirectMessages = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const cursorPaginationData = await $trpc.room.directMessage.readDirectMessages.query({ cursor });
      if (cursorPaginationData.items.length > 0) {
        const directMessageParticipants = await $trpc.room.directMessage.readDirectMessageParticipants.query(
          cursorPaginationData.items.map(({ id }) => id),
        );
        for (const { participants, roomId } of directMessageParticipants)
          storeDirectMessageParticipants(roomId, participants);
      }
      return cursorPaginationData;
    }, onComplete);

  return { readDirectMessages, readMoreDirectMessages };
};
