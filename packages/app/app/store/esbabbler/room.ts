import type { Room } from "#shared/db/schema/rooms";
import type { User } from "#shared/db/schema/users";
import type { CreateRoomInput } from "#shared/models/db/room/CreateRoomInput";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { LeaveRoomInput } from "#shared/models/db/room/LeaveRoomInput";
import type { UpdateRoomInput } from "#shared/models/db/room/UpdateRoomInput";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { dayjs } from "#shared/services/dayjs";
import { createDataMap } from "@/services/shared/createDataMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationData } from "@/services/shared/pagination/cursor/createCursorPaginationData";
import { uuidValidateV4 } from "@esposter/shared";
import { useFuse } from "@vueuse/integrations/useFuse";

export const useRoomStore = defineStore("esbabbler/room", () => {
  const { $trpc } = useNuxtApp();
  const { itemList, ...restData } = createCursorPaginationData<Room>();
  const {
    createRoom: storeCreateRoom,
    deleteRoom: storeDeleteRoom,
    roomList,
    updateRoom: storeUpdateRoom,
    ...restOperationData
  } = createOperationData(itemList, ["id"], DatabaseEntityType.Room);
  const rooms = computed(() => roomList.value.toSorted((a, b) => dayjs(a.updatedAt).diff(b.updatedAt)));
  const router = useRouter();
  const currentRoomId = computed(() => {
    const roomId = router.currentRoute.value.params.id;
    return typeof roomId === "string" && uuidValidateV4(roomId) ? roomId : undefined;
  });
  const currentRoom = computed(() => {
    if (!currentRoomId.value) return undefined;
    return roomList.value.find(({ id }) => id === currentRoomId.value);
  });
  const currentRoomName = computed(() => currentRoom.value?.name ?? "");

  const createRoom = async (input: CreateRoomInput) => {
    const newRoom = await $trpc.room.createRoom.mutate(input);
    if (!newRoom) return;

    storeCreateRoom(newRoom, true);
  };
  const updateRoom = async (input: UpdateRoomInput) => {
    const updatedRoom = await $trpc.room.updateRoom.mutate(input);
    if (!updatedRoom) return;

    storeUpdateRoom(updatedRoom);
  };
  const deleteRoom = async (input: DeleteRoomInput) => {
    const deletedRoom = await $trpc.room.deleteRoom.mutate(input);
    if (!deletedRoom) return;

    storeDeleteRoom({ id: deletedRoom.id });
  };
  const leaveRoom = (input: LeaveRoomInput) => $trpc.room.leaveRoom.mutate(input);

  const roomSearchQuery = ref("");
  const roomsSearched = computed<Room[]>(() => {
    if (!roomSearchQuery.value) return [];

    const { results } = useFuse(roomSearchQuery, roomList, {
      fuseOptions: {
        keys: ["name"],
      },
    });
    return results.value.map(({ item }) => item);
  });

  const { data: creatorMap } = createDataMap(currentRoomId, new Map<string, User>());

  return {
    rooms,
    ...restOperationData,
    createRoom,
    deleteRoom,
    leaveRoom,
    updateRoom,
    ...restData,
    creatorMap,
    currentRoom,
    currentRoomId,
    currentRoomName,
    roomSearchQuery,
    roomsSearched,
  };
});
