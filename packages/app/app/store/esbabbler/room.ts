import type { Room } from "#shared/db/schema/rooms";
import type { CreateRoomInput } from "#shared/models/db/room/CreateRoomInput";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { JoinRoomInput } from "#shared/models/db/room/JoinRoomInput";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { RoutePath } from "#shared/models/router/RoutePath";
import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationData } from "@/services/shared/pagination/cursor/createCursorPaginationData";
import { uuidValidateV4 } from "@esposter/shared";

export const useRoomStore = defineStore("esbabbler/room", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = createCursorPaginationData<Room>();
  const {
    createRoom: storeCreateRoom,
    deleteRoom: storeDeleteRoom,
    rooms,
    updateRoom: storeUpdateRoom,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Room);
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
  const joinRoom = async (input: JoinRoomInput) => {
    const joinedRoom = await $trpc.room.joinRoom.mutate(input);
    if (!joinedRoom) return;

    storeCreateRoom(joinedRoom, true);
    await navigateTo(RoutePath.Messages(joinedRoom.id));
  };
  const leaveRoom = async (input: DeleteRoomInput) => {
    const id = await $trpc.room.leaveRoom.mutate(input);
    if (!id) return;

    storeDeleteRoom({ id });
  };

  return {
    createRoom,
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
