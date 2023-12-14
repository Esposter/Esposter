import type { Room } from "@/db/schema/rooms";
import { createCursorPaginationData } from "@/services/shared/pagination/createCursorPaginationData";
import Fuse from "fuse.js";

export const useRoomStore = defineStore("esbabbler/room", () => {
  const currentRoomId = ref<string | null>(null);
  const { items: roomList, ...rest } = createCursorPaginationData<Room>();
  const currentRoomName = computed(() => {
    if (!currentRoomId.value) return "";
    const currentRoom = roomList.value.find((r) => r.id === currentRoomId.value);
    return currentRoom?.name ?? "";
  });
  const pushRooms = (rooms: Room[]) => {
    roomList.value.push(...rooms);
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
  const roomsSearched = computed<Room[]>(() => {
    if (!roomSearchQuery.value) return [];

    const fuse = new Fuse(roomList.value);
    return fuse.search(roomSearchQuery.value).map((x) => x.item);
  });

  return {
    currentRoomId,
    roomList,
    ...rest,
    currentRoomName,
    pushRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    roomSearchQuery,
    roomsSearched,
  };
});
