import type { Room } from "#shared/db/schema/rooms";

import { useRoomStore } from "@/store/esbabbler/room";

export const useReadRooms = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { initializeCursorPaginationData, pushRoomList } = roomStore;
  const { creatorMap, currentRoomId, hasMore, nextCursor } = storeToRefs(roomStore);
  const readCreators = useReadCreators(creatorMap);
  const readMetadata = (rooms: Room[]) => Promise.all([readCreators(rooms.map(({ userId }) => userId))]);
  const readMoreRooms = async (onComplete: () => void) => {
    try {
      const response = await $trpc.room.readRooms.query({ cursor: nextCursor.value });
      nextCursor.value = response.nextCursor;
      hasMore.value = response.hasMore;
      if (response.items.length === 0) return;
      pushRoomList(...response.items);
      await readMetadata(response.items);
    } finally {
      onComplete();
    }
  };

  const onComplete = async () => {
    if (!currentRoomId.value) return;

    const [item, response] = await Promise.all([
      currentRoomId.value ? $trpc.room.readRoom.query(currentRoomId.value) : null,
      $trpc.room.readRooms.query(),
    ]);
    if (item && !response.items.some(({ id }) => id === item.id)) response.items.push(item);
    initializeCursorPaginationData(response);
    if (response.items.length === 0) return;

    await readMetadata(response.items);
  };

  await onComplete();
  return readMoreRooms;
};
