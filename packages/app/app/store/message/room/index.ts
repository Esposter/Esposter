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
    await navigateTo(rooms.value.length > 0 ? RoutePath.Messages(takeOne(rooms.value).id) : RoutePath.MessagesIndex, {
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

  const { executeMutation: executeCreateRoomMutation } = useMutation();
  const { executeMutation: executeJoinRoomMutation } = useMutation();
  const { executeMutation: executeLeaveRoomMutation } = useMutation();
  // Server-generated results (ids, navigation targets) — non-optimistic, applied in onSuccess
  const createRoom = async (input: CreateRoomInput) => {
    await executeCreateRoomMutation(() => $trpc.room.createRoom.mutate(input), {
      onSuccess: (newRoom) => {
        storeCreateRoom(newRoom, true);
      },
    });
  };
  // Rooms are deleted independently, so each deletion gets its own executor — a shared one would treat an
  // Earlier in-flight deletion as stale and swallow both its rollback and its active-room navigation
  const deleteRoom = async (input: DeleteRoomInput) => {
    const { executeMutation: executeDeleteRoomMutation } = useMutation();
    const snapshot = [...items.value];
    let isSuccessful = false;
    await executeDeleteRoomMutation(() => $trpc.room.deleteRoom.mutate(input), {
      applyOptimistic: () => {
        baseStoreDeleteRoom({ id: input });
        return () => {
          items.value = snapshot;
        };
      },
      onSuccess: async () => {
        isSuccessful = true;
        if (currentRoomId.value !== input) return;
        await navigateTo(
          rooms.value.length > 0 ? RoutePath.Messages(takeOne(rooms.value).id) : RoutePath.MessagesIndex,
          {
            replace: true,
          },
        );
      },
    });
    return isSuccessful;
  };
  const joinRoom = async (input: JoinRoomInput) => {
    await executeJoinRoomMutation(() => $trpc.room.joinRoom.mutate(input), {
      onSuccess: async (joinedRoom) => {
        storeCreateRoom(joinedRoom, true);
        await navigateTo(RoutePath.Messages(joinedRoom.id));
      },
    });
  };
  const leaveRoom = async (input: LeaveRoomInput) => {
    const snapshot = [...items.value];
    let isSuccessful = false;
    await executeLeaveRoomMutation(() => $trpc.room.leaveRoom.mutate(input), {
      applyOptimistic: () => {
        baseStoreDeleteRoom({ id: input });
        return () => {
          items.value = snapshot;
        };
      },
      onSuccess: async () => {
        isSuccessful = true;
        if (currentRoomId.value !== input) return;
        await navigateTo(
          rooms.value.length > 0 ? RoutePath.Messages(takeOne(rooms.value).id) : RoutePath.MessagesIndex,
          {
            replace: true,
          },
        );
      },
    });
    return isSuccessful;
  };
  MessageHookMap[Operation.Create].register(({ message, partitionKey, type }) => {
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
