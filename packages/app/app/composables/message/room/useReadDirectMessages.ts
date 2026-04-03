import { useDirectMessageStore } from "@/store/message/room/directMessage";

export const useReadDirectMessages = () => {
  const { $trpc } = useNuxtApp();
  const directMessageStore = useDirectMessageStore();
  const { readItems, readMoreItems } = directMessageStore;

  const readDirectMessages = () =>
    readItems(async () => {
      const data = await $trpc.directMessage.readDirectMessages.query();
      if (data.items.length > 0) {
        const participantsData = await $trpc.directMessage.readDirectMessageParticipants.query(
          data.items.map(({ id }) => id),
        );
        for (const { participants, roomId } of participantsData)
          directMessageStore.directMessageParticipantsMap.set(roomId, participants);
      }
      return data;
    });

  const readMoreDirectMessages = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const data = await $trpc.directMessage.readDirectMessages.query({ cursor });
      if (data.items.length > 0) {
        const participantsData = await $trpc.directMessage.readDirectMessageParticipants.query(
          data.items.map(({ id }) => id),
        );
        for (const { participants, roomId } of participantsData)
          directMessageStore.directMessageParticipantsMap.set(roomId, participants);
      }
      return data;
    }, onComplete);

  return { readDirectMessages, readMoreDirectMessages };
};
