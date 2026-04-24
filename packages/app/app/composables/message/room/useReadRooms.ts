import { useRoomStore } from "@/store/message/room";

export const useReadRooms = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const readUserToRooms = useReadUserToRooms();
  const readMyPermissions = useReadMyPermissions();
  const readRoles = useReadRoles();
  const readRooms = () =>
    readItems(
      () => $trpc.room.readRooms.query({ roomId: currentRoomId.value }),
      async ({ items }) => {
        const roomIds = items.map(({ id }) => id);
        if (roomIds.length === 0) return;
        await Promise.all([readUserToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      },
    );
  const readMoreRooms = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const response = await $trpc.room.readRooms.query({ cursor });
      const roomIds = response.items.map(({ id }) => id);
      if (roomIds.length === 0) return response;
      await Promise.all([readUserToRooms(roomIds), readMyPermissions(roomIds), readRoles(roomIds)]);
      return response;
    }, onComplete);
  return { readMoreRooms, readRooms };
};
