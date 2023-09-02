import type { Room } from "@/db/schema/rooms";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadRooms = async () => {
  const { $client } = useNuxtApp();
  const roomStore = useRoomStore();
  const { pushRoomList, updateRoomListNextCursor, initialiseRoomList } = roomStore;
  const { currentRoomId, roomListNextCursor } = storeToRefs(roomStore);
  const readMoreRooms = async (onComplete: () => void) => {
    try {
      const { rooms, nextCursor } = await $client.room.readRooms.query({ cursor: roomListNextCursor.value });
      pushRoomList(rooms);
      updateRoomListNextCursor(nextCursor);
    } finally {
      onComplete();
    }
  };

  const [roomData, { rooms: roomsData, nextCursor }] = await Promise.all([
    currentRoomId.value ? $client.room.readRoom.query(currentRoomId.value) : null,
    $client.room.readRooms.query({ cursor: null }),
  ]);
  const initialRooms: Room[] = [];
  if (roomData && !roomsData.some((r) => r.id === roomData.id)) initialRooms.push(roomData);
  initialRooms.push(...roomsData);
  updateRoomListNextCursor(nextCursor);
  initialiseRoomList(initialRooms);

  return readMoreRooms;
};
