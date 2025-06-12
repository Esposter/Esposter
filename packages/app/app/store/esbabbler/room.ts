import type { Room } from "#shared/db/schema/rooms";
import type { CreateRoomInput } from "#shared/models/db/room/CreateRoomInput";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { JoinRoomInput } from "#shared/models/db/room/JoinRoomInput";
import type { LeaveRoomInput } from "#shared/models/db/room/LeaveRoomInput";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { RoutePath } from "#shared/models/router/RoutePath";
import { dayjs } from "#shared/services/dayjs";
import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationData } from "@/services/shared/pagination/cursor/createCursorPaginationData";
import { uuidValidateV4 } from "@esposter/shared";

export const useRoomStore = defineStore("esbabbler/room", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = createCursorPaginationData<Room>();
  const {
    createRoom: storeCreateRoom,
    deleteRoom: storeDeleteRoom,
    rooms: storeRooms,
    updateRoom: storeUpdateRoom,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Room);
  const rooms = computed(() => storeRooms.value.toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)));
  const router = useRouter();
  const currentRoomId = computed(() => {
    const roomId = router.currentRoute.value.params.id;
    return typeof roomId === "string" && uuidValidateV4(roomId) ? roomId : undefined;
  });
  const currentRoom = computed(() => {
    if (!currentRoomId.value) return undefined;
    return rooms.value.find(({ id }) => id === currentRoomId.value);
  });
  const currentRoomName = computed(() => currentRoom.value?.name ?? "");

  const createRoom = async (input: CreateRoomInput) => {
    const newRoom = await $trpc.room.createRoom.mutate(input);
    storeCreateRoom(newRoom, true);
  };
  const deleteRoom = async (input: DeleteRoomInput) => {
    const { id } = await $trpc.room.deleteRoom.mutate(input);
    storeDeleteRoom({ id });
  };
  const joinRoom = async (input: JoinRoomInput) => {
    const joinedRoom = await $trpc.room.joinRoom.mutate(input);
    storeCreateRoom(joinedRoom, true);
    await navigateTo(RoutePath.Messages(joinedRoom.id));
  };
  const leaveRoom = async (input: LeaveRoomInput) => {
    const id = await $trpc.room.leaveRoom.mutate(input);
    storeDeleteRoom({ id });
  };

  return {
    createRoom,
    deleteRoom,
    joinRoom,
    leaveRoom,
    storeDeleteRoom,
    storeUpdateRoom,
    ...restOperationData,
    rooms,
    ...restData,
    currentRoom,
    currentRoomId,
    currentRoomName,
    ...useSearcher(
      (searchQuery, cursor) =>
        $trpc.room.readRooms.query({
          cursor,
          filter: { name: searchQuery },
        }),
      DatabaseEntityType.Room,
    ),
  };
});
