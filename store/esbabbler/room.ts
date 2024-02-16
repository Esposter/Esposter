import { type Room } from "@/db/schema/rooms";
import { DatabaseEntityType } from "@/models/shared/entity/DatabaseEntityType";
import {
  type CreateRoomInput,
  type DeleteRoomInput,
  type LeaveRoomInput,
  type UpdateRoomInput,
} from "@/server/trpc/routers/room";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { createCursorPaginationData } from "@/services/shared/pagination/cursor/createCursorPaginationData";
import Fuse from "fuse.js";

export const useRoomStore = defineStore("esbabbler/room", () => {
  const { $client } = useNuxtApp();
  const { itemList, ...restData } = createCursorPaginationData<Room>();
  const {
    roomList,
    createRoom: storeCreateRoom,
    updateRoom: storeUpdateRoom,
    deleteRoom: storeDeleteRoom,
    ...restOperationData
  } = createOperationData(itemList, DatabaseEntityType.Room);
  const currentRoomId = ref<string | null>(null);
  const currentRoomName = computed(() => {
    if (!currentRoomId.value) return "";
    const currentRoom = roomList.value.find((r) => r.id === currentRoomId.value);
    return currentRoom?.name ?? "";
  });

  const createRoom = async (input: CreateRoomInput) => {
    const newRoom = await $client.room.createRoom.mutate(input);
    if (!newRoom) return;

    storeCreateRoom(newRoom);
  };
  const updateRoom = async (input: UpdateRoomInput) => {
    const updatedRoom = await $client.room.updateRoom.mutate(input);
    if (!updatedRoom) return;

    storeUpdateRoom(updatedRoom);
  };
  const deleteRoom = async (input: DeleteRoomInput) => {
    const deletedRoom = await $client.room.deleteRoom.mutate(input);
    if (!deletedRoom) return;

    storeDeleteRoom(deletedRoom.id);
  };
  const leaveRoom = (input: LeaveRoomInput) => $client.room.leaveRoom.mutate(input);

  const roomSearchQuery = ref("");
  const roomsSearched = computed<Room[]>(() => {
    if (!roomSearchQuery.value) return [];

    const fuse = new Fuse(roomList.value, { keys: ["name"] });
    return fuse.search(roomSearchQuery.value).map((x) => x.item);
  });

  return {
    roomList,
    ...restOperationData,
    createRoom,
    updateRoom,
    deleteRoom,
    leaveRoom,
    ...restData,
    currentRoomId,
    currentRoomName,
    roomSearchQuery,
    roomsSearched,
  };
});
