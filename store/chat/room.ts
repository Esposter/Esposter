import type { Room } from "@prisma/client";

export const useRoomStore = defineStore("chat/room", () => {
  const currentRoomId = ref<string | null>(null);
  const roomList = ref<Room[]>([]);
  const pushRoomList = (rooms: Room[]) => roomList.value.push(...rooms);
  const rooms = computed(() => roomList.value.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));

  const roomListNextCursor = ref<string | null>(null);
  const updateRoomListNextCursor = (nextCursor: string | null) => {
    roomListNextCursor.value = nextCursor;
  };

  const roomName = computed(() => {
    if (!currentRoomId.value) return "";
    const currentRoom = roomList.value.find((r) => r.id === currentRoomId.value);
    return currentRoom?.name ?? "";
  });
  const initialiseRoomList = (rooms: Room[]) => {
    roomList.value = rooms;
  };
  const createRoom = (newRoom: Room) => {
    roomList.value.push(newRoom);
  };
  const updateRoom = (updatedRoom: Room) => {
    const index = roomList.value.findIndex((r) => r.id === updatedRoom.id);
    if (index > -1) roomList.value[index] = { ...roomList.value[index], ...updatedRoom };
  };
  const deleteRoom = (id: string) => {
    roomList.value = roomList.value.filter((r) => r.id !== id);
  };

  const roomSearchQuery = ref("");
  const roomsSearched = computed(() =>
    roomSearchQuery.value
      ? roomList.value
          .filter((r) => r.name.toLowerCase().includes(roomSearchQuery.value.toLowerCase()))
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      : []
  );

  return {
    currentRoomId,
    pushRoomList,
    rooms,
    roomListNextCursor,
    updateRoomListNextCursor,
    roomName,
    initialiseRoomList,
    createRoom,
    updateRoom,
    deleteRoom,
    roomSearchQuery,
    roomsSearched,
  };
});
