import type { Room } from "@/db/schema/rooms";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadRooms = async () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { initialisePaginationData, pushRooms } = roomStore;
  const { currentRoomId, nextCursor, hasMore } = storeToRefs(roomStore);
  const readMoreRooms = async (onComplete: () => void) => {
    try {
      const response = await $client.room.readRooms.query({ cursor: nextCursor.value });
      pushRooms(response.items);
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
  initialisePaginationData({ ...response, items: initialRooms });
  return readMoreRooms;
};
