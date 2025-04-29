import type { Room } from "#shared/db/schema/rooms";

import { useRoomStore } from "@/store/esbabbler/room";

export const useReadRooms = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { initializeCursorPaginationData, pushRooms } = roomStore;
  const { currentRoomId, hasMore, nextCursor } = storeToRefs(roomStore);
  const readUsers = useReadUsers();
  const readMetadata = (rooms: Room[]) => Promise.all([readUsers(rooms.map(({ userId }) => userId))]);
  const readMoreRooms = async (onComplete: () => void) => {
    try {
      const response = await $trpc.room.readRooms.query({ cursor: nextCursor.value });
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      await readMetadata(response.items);
      pushRooms(...response.items);
    } finally {
      onComplete();
    }
  };

  if (currentRoomId.value) {
    const [item, response] = await Promise.all([
      currentRoomId.value ? $trpc.room.readRoom.query(currentRoomId.value) : null,
      $trpc.room.readRooms.query(),
    ]);
    if (item && !response.items.some(({ id }) => id === item.id)) response.items.push(item);
    await readMetadata(response.items);
    initializeCursorPaginationData(response);
  }

  return readMoreRooms;
};
