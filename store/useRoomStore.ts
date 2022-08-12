import type { Room } from "@prisma/client";
import { defineStore } from "pinia";

export const useRoomStore = defineStore("room", () => {
  const currentRoomId = ref<string | null>(null);
  const roomSearchBarFocused = ref(false);
  const roomSearchQuery = ref("");
  const loadingRoomsSearched = ref(false);
  const roomList = ref<Room[]>([]);
  const roomListSearched = ref<Room[]>([]);
  const rooms = computed(() => {
    // @NOTE Remove manually changing to date after adding superjson transformer
    return roomSearchBarFocused.value
      ? roomListSearched.value.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      : roomList.value.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });
  const pushRooms = (rooms: Room[]) => {
    if (roomSearchBarFocused.value) roomListSearched.value.push(...rooms);
    else roomList.value.push(...rooms);
  };

  const roomListNextCursor = ref<string | null>(null);
  const roomListSearchedNextCursor = ref<string | null>(null);
  const roomNextCursor = computed(() =>
    roomSearchBarFocused.value ? roomListSearchedNextCursor.value : roomListNextCursor.value
  );
  const updateRoomNextCursor = (nextCursor: string | null) => {
    if (roomSearchBarFocused.value) roomListSearchedNextCursor.value = nextCursor;
    else roomListNextCursor.value = nextCursor;
  };

  const roomName = computed(() => {
    if (!currentRoomId.value) return "";
    const currentRoom = roomList.value.find((r) => r.id === currentRoomId.value);
    return currentRoom?.name ?? "";
  });
  const initialiseRooms = (rooms: Room[]) => {
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

  return {
    currentRoomId,
    roomSearchBarFocused,
    roomSearchQuery,
    loadingRoomsSearched,
    roomList,
    rooms,
    pushRooms,
    roomListSearched,
    roomListSearchedNextCursor,
    roomNextCursor,
    updateRoomNextCursor,
    roomName,
    initialiseRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  };
});
