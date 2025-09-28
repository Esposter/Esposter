import type { Room } from "#shared/db/schema/rooms";
import type { User } from "#shared/db/schema/users";
import type { CreateRoomInput } from "#shared/models/db/room/CreateRoomInput";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { JoinRoomInput } from "#shared/models/db/room/JoinRoomInput";
import type { LeaveRoomInput } from "#shared/models/db/room/LeaveRoomInput";

import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { RoutePath } from "#shared/models/router/RoutePath";
import { dayjs } from "#shared/services/dayjs";
import { createOperationData } from "@/services/shared/createOperationData";
import { uuidValidateV4 } from "@esposter/shared";

export const useRoomStore = defineStore("message/room", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = useCursorPaginationData<Room>();
  const {
    createRoom: storeCreateRoom,
    deleteRoom: baseStoreDeleteRoom,
    updateRoom: storeUpdateRoom,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Room);
  const rooms = computed(() => items.value.toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)));
  const storeDeleteRoom = async (...args: Parameters<typeof baseStoreDeleteRoom>) => {
    baseStoreDeleteRoom(...args);
    await router.push({
      path: rooms.value.length > 0 ? RoutePath.Messages(rooms.value[0].id) : RoutePath.MessagesIndex,
      replace: true,
    });
  };
  const {
    data: memberMap,
    getDataMap: getMemberDataMap,
    setDataMap: setMemberDataMap,
  } = useDataMap(() => currentRoomId.value, new Map<string, User>());
  const router = useRouter();
  const currentRoomId = computed(() => {
    const roomId = router.currentRoute.value.params.id;
    return typeof roomId === "string" && uuidValidateV4(roomId) ? roomId : undefined;
  });
  const currentRoom = computed(() => {
    if (!currentRoomId.value) return null;
    return rooms.value.find(({ id }) => id === currentRoomId.value) ?? null;
  });
  const { name: currentRoomName, placeholder: placeholderRoomName } = useRoomName(currentRoom);

  const createRoom = async (input: CreateRoomInput) => {
    const newRoom = await $trpc.room.createRoom.mutate(input);
    storeCreateRoom(newRoom, true);
  };
  const deleteRoom = async (input: DeleteRoomInput) => {
    const { id } = await $trpc.room.deleteRoom.mutate(input);
    await storeDeleteRoom({ id });
  };
  const joinRoom = async (input: JoinRoomInput) => {
    const joinedRoom = await $trpc.room.joinRoom.mutate(input);
    storeCreateRoom(joinedRoom, true);
    await navigateTo(RoutePath.Messages(joinedRoom.id));
  };
  const leaveRoom = async (input: LeaveRoomInput) => {
    const id = await $trpc.room.leaveRoom.mutate(input);
    await storeDeleteRoom({ id });
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
    getMemberDataMap,
    memberMap,
    placeholderRoomName,
    setMemberDataMap,
  };
});
