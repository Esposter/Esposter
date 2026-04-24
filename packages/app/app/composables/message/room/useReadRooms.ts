import { useRoomStore } from "@/store/message/room";

export const useReadRooms = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const readUserToRoomsMetadata = useReadUserToRooms();
  const readMyPermissions = useReadMyPermissions();
  const readRooms = () =>
    readItems(
      () => $trpc.room.readRooms.query({ roomId: currentRoomId.value }),
      async ({ items }) => {
        const roomIds = items.map(({ id }) => id);
        if (roomIds.length === 0) return;
        await Promise.all([readUserToRoomsMetadata(roomIds), readMyPermissions(roomIds)]);
      },
    );
  const readMoreRooms = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const response = await $trpc.room.readRooms.query({ cursor });
      const roomIds = response.items.map(({ id }) => id);
      if (roomIds.length === 0) return response;
      await Promise.all([readUserToRoomsMetadata(roomIds), readMyPermissions(roomIds)]);
      return response;
    }, onComplete);
  return { readMoreRooms, readRooms };
};
