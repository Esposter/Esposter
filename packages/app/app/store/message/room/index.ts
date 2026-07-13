import type { CreateRoomInput } from "#shared/models/db/room/CreateRoomInput";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { JoinRoomInput } from "#shared/models/db/room/JoinRoomInput";
import type { LeaveRoomInput } from "#shared/models/db/room/LeaveRoomInput";
import type { RoomInMessage } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { useMutation } from "@/composables/shared/useMutation";
import { authClient } from "@/services/auth/authClient";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType, MessageType } from "@esposter/db-schema";
import { Operation, RoutePath, takeOne, uuidValidateV4 } from "@esposter/shared";

export const useRoomStore = defineStore("message/room", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = useCursorPaginationData<RoomInMessage>();
  const {
    createRoom: storeCreateRoom,
    deleteRoom: baseStoreDeleteRoom,
    updateRoom: storeUpdateRoom,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Room);
  const rooms = computed(() => items.value.toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)));
  const storeDeleteRoom = async (...args: Parameters<typeof baseStoreDeleteRoom>) => {
    const [{ id }] = args;
    baseStoreDeleteRoom(...args);
    if (currentRoomId.value !== id) return;
    await router.push({
      path: rooms.value.length > 0 ? RoutePath.Messages(takeOne(rooms.value).id) : RoutePath.MessagesIndex,
      replace: true,
    });
  };
  const router = useRouter();
  const currentRoomId = computed(() => {
    const roomId = router.currentRoute.value.params.id;
    return typeof roomId === "string" && uuidValidateV4(roomId) ? roomId : "";
  });
  const currentRoom = computed(() => {
    if (!currentRoomId.value) return undefined;
    return rooms.value.find(({ id }) => id === currentRoomId.value);
  });
  const session = authClient.useSession();
  const isCreator = computed(() => currentRoom.value?.userId === session.value.data?.user.id);

  const executeMutation = useMutation();
  // Server-generated results (ids, navigation targets) — non-optimistic, applied in onSuccess
  const createRoom = async (input: CreateRoomInput) => {
    await executeMutation(() => $trpc.room.createRoom.mutate(input), {
      onSuccess: (newRoom) => {
        storeCreateRoom(newRoom, true);
      },
    });
  };
  const deleteRoom = async (input: DeleteRoomInput) => {
    await executeMutation(() => $trpc.room.deleteRoom.mutate(input), {
      onSuccess: ({ id }) => {
        void storeDeleteRoom({ id });
      },
    });
  };
  const joinRoom = async (input: JoinRoomInput) => {
    await executeMutation(() => $trpc.room.joinRoom.mutate(input), {
      onSuccess: async (joinedRoom) => {
        storeCreateRoom(joinedRoom, true);
        await navigateTo(RoutePath.Messages(joinedRoom.id));
      },
    });
  };
  const leaveRoom = async (input: LeaveRoomInput) => {
    const snapshot = [...items.value];
    await executeMutation(() => $trpc.room.leaveRoom.mutate(input), {
      applyOptimistic: () => {
        void storeDeleteRoom({ id: input });
        return () => {
          items.value = snapshot;
        };
      },
    });
  };
  MessageHookMap[Operation.Create].push(({ message, partitionKey, type }) => {
    if (type !== MessageType.EditRoom) return;
    storeUpdateRoom({ id: partitionKey, name: message });
  });

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
    isCreator,
  };
});
