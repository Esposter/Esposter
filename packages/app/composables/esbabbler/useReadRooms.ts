import type { Room } from "@/shared/db/schema/rooms";

import { useRoomStore } from "@/store/esbabbler/room";

export const useReadRooms = async () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { initializeCursorPaginationData, pushRoomList } = roomStore;
  const { currentRoomId, hasMore, nextCursor } = storeToRefs(roomStore);
  const readMoreRooms = async (onComplete: () => void) => {
    try {
      const response = await $client.room.readRooms.query({ cursor: nextCursor.value });
      pushRoomList(...response.items);
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
    } finally {
      onComplete();
    }
  };

  const [item, response] = await Promise.all([
    currentRoomId.value ? $client.room.readRoom.query(currentRoomId.value) : null,
    $client.room.readRooms.query(),
  ]);
  const initialRooms: Room[] = [];
  if (item && !response.items.some((r) => r.id === item.id)) initialRooms.push(item);
  initialRooms.push(...response.items);
  initializeCursorPaginationData({ ...response, items: initialRooms });
  return readMoreRooms;
};
