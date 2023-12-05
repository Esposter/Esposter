import type { Room } from "@/db/schema/rooms";
import type { PaginationData } from "@/models/shared/pagination/PaginationData";
import Fuse from "fuse.js";

export const useRoomStore = defineStore("esbabbler/room", () => {
  const currentRoomId = ref<string | null>(null);
  const paginationData = ref<PaginationData<Room>>({
    items: [],
    nextCursor: null,
    hasMore: false,
  });
  const roomList = computed({
    get: () => paginationData.value.items,
    set: (rooms: Room[]) => {
      paginationData.value.items = rooms;
    },
  });
  const currentRoomName = computed(() => {
    if (!currentRoomId.value) return "";
    const currentRoom = roomList.value.find((r) => r.id === currentRoomId.value);
    return currentRoom?.name ?? "";
  });
  const nextCursor = computed({
    get: () => paginationData.value.nextCursor,
    set: (nextCursor: string | null) => {
      paginationData.value.nextCursor = nextCursor;
    },
  });
  const hasMore = computed({
    get: () => paginationData.value.hasMore,
    set: (hasMore: boolean) => {
      paginationData.value.hasMore = hasMore;
    },
  });

  const initialisePaginationData = (data: PaginationData<Room>) => {
    paginationData.value = data;
  };
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
    currentRoomName,
    nextCursor,
    hasMore,
    initialisePaginationData,
    pushRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    roomSearchQuery,
    roomsSearched,
  };
});
