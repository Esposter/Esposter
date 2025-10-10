import type { Room } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

export const useReadRooms = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const readUsers = useReadUsers();
  const readMetadata = (rooms: Room[]) => readUsers(rooms.map(({ userId }) => userId));
  const readRooms = () =>
    readItems(
      () => $trpc.room.readRooms.useQuery({ roomId: currentRoomId.value }),
      ({ items }) => readMetadata(items),
    );
  const readMoreRooms = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const cursorPaginationData = await $trpc.room.readRooms.query({ cursor });
      await readMetadata(cursorPaginationData.items);
      return cursorPaginationData;
    }, onComplete);
  return { readMoreRooms, readRooms };
};
