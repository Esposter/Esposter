import type { Room } from "#shared/db/schema/rooms";
import type { CreateRoomInput } from "#shared/models/db/room/CreateRoomInput";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { JoinRoomInput } from "#shared/models/db/room/JoinRoomInput";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { RoutePath } from "#shared/models/router/RoutePath";
import { dayjs } from "#shared/services/dayjs";
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
    roomSearchQuery,
    roomsSearched,
  };
});
