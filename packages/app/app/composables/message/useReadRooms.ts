import type { Room } from "#shared/db/schema/rooms";

import { useRoomStore } from "@/store/message/room";

export const useReadRooms = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { initializeCursorPaginationData, pushRooms } = roomStore;
  const { currentRoomId, hasMore, nextCursor } = storeToRefs(roomStore);
  const readUsers = useReadUsers();
  const readMetadata = (rooms: Room[]) => readUsers(rooms.map(({ userId }) => userId));
  const readMoreRooms = async (onComplete: () => void) => {
    try {
      const {
        hasMore: newHasMore,
        items,
        nextCursor: newNextCursor,
      } = await $trpc.room.readRooms.query({ cursor: nextCursor.value });
      nextCursor.value = newNextCursor;
      hasMore.value = newHasMore;
      await readMetadata(items);
      pushRooms(...items);
    } finally {
      onComplete();
    }
  };

  if (currentRoomId.value) {
    const [item, response] = await Promise.all([
      currentRoomId.value ? $trpc.room.readRoom.query(currentRoomId.value) : Promise.resolve(null),
      $trpc.room.readRooms.query(),
    ]);
    if (item && !response.items.some(({ id }) => id === item.id)) response.items.push(item);
    await readMetadata(response.items);
    initializeCursorPaginationData(response);
  }

  return readMoreRooms;
};
