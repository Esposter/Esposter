import type { Room } from "#shared/db/schema/rooms";

import { useRoomStore } from "@/store/message/room";

export const useReadRooms = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const readUsers = useReadUsers();
  const readMetadata = (rooms: Room[]) => readUsers(rooms.map(({ userId }) => userId));
  const readRooms = () =>
    readItems(async () => {
      const [room, cursorPaginationData] = await Promise.all([
        currentRoomId.value ? $trpc.room.readRoom.query(currentRoomId.value) : Promise.resolve(null),
        $trpc.room.readRooms.query(),
      ]);
      if (room && !cursorPaginationData.items.some(({ id }) => id === room.id)) cursorPaginationData.items.push(room);
      await readMetadata(cursorPaginationData.items);
      return cursorPaginationData;
    });
  const readMoreRooms = () =>
    readMoreItems(async (cursor) => {
      const cursorPaginationData = await $trpc.room.readRooms.query({ cursor });
      await readMetadata(cursorPaginationData.items);
      return cursorPaginationData;
    });
  return { readMoreRooms, readRooms };
};
