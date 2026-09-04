import type { CreateRoomInput } from "#shared/models/db/room/CreateRoomInput";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { JoinRoomInput } from "#shared/models/db/room/JoinRoomInput";
import type { LeaveRoomInput } from "#shared/models/db/room/LeaveRoomInput";
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomDialogStore } from "@/store/message/room/dialog";
import { DatabaseEntityType, MessageType } from "@esposter/db-schema";
import { checkIsUuidV4, Operation, RoutePath, takeOne } from "@esposter/shared";

export const useRoomStore = defineStore("message/room", () => {
  const { $trpc } = useNuxtApp();
  const { getSlice, items, ...restData } = useCursorPaginationData<RoomInMessage>();
  const {
    createRoom: storeCreateRoom,
    deleteRoom: baseStoreDeleteRoom,
    updateRoom: storeUpdateRoom,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.Room);
  const rooms = computed(() =>
    items.value.toSorted((firstRoom, secondRoom) => secondRoom.updatedAt.getTime() - firstRoom.updatedAt.getTime()),
  );
  const router = useRouter();
  const currentRoomId = computed(() => {
    const roomId = router.currentRoute.value.params.id;
    return typeof roomId === "string" && checkIsUuidV4(roomId) ? roomId : "";
  });
  const roomDialogStore = useRoomDialogStore();
  // Which room the room-scoped surfaces are reading for. The route decides it, except while room settings is open
  // Over another room: the dialog names its own room, and its panels read the same keyed slices the room list and
  // The message list do — so without this the cog would have to navigate first, which is a flicker and a place
  // The reader never asked to go
  const scopedRoomId = computed(() => roomDialogStore.settingsRoomId || currentRoomId.value);
  // Every way a room leaves the list — deleted here, left here, or removed by a subscription — hands the user
  // To the next room when it was the one on screen. Read at the moment the removal lands, so the replacement
  // Is whatever is still there rather than what was there when the write was issued
  const navigateFromDeletedRoom = async (roomId: string) => {
    if (currentRoomId.value !== roomId) return;
    await navigateTo(rooms.value.length > 0 ? RoutePath.Messages(takeOne(rooms.value).id) : RoutePath.MessagesIndex, {
      replace: true,
    });
  };
  const storeDeleteRoom = async (...args: Parameters<typeof baseStoreDeleteRoom>) => {
    const [{ id }] = args;
    baseStoreDeleteRoom(...args);
    await navigateFromDeletedRoom(id);
  };
  const currentRoom = computed(() => {
    if (!currentRoomId.value) return undefined;
    return rooms.value.find(({ id }) => id === currentRoomId.value);
  });
  const session = authClient.useSession();
  const isCreator = computed(() => currentRoom.value?.userId === session.value.data?.user.id);

  const { executeMutation: executeCreateRoomMutation } = useMutation();
  const { executeMutation: executeJoinRoomMutation } = useMutation();
  const { executeMutation: executeLeaveRoomMutation } = useMutation();
  const { executeMutation: executeDeleteRoomMutation } = useMutation();
  // Server-generated results (ids, navigation targets) — non-optimistic, applied in onSuccess
  const createRoom = async (input: CreateRoomInput) => {
    // Creates have no natural entity key, so each call gets a unique one — overlapping creates are
    // Independent operations and must never queue behind each other
    await executeCreateRoomMutation(() => $trpc.room.createRoom.mutate(input), {
      key: Symbol("createRoom"),
      onSuccess: (newRoom) => {
        storeCreateRoom(newRoom, true);
      },
    });
  };
  // Rooms are deleted independently, so each deletion is keyed by its room id — an unkeyed executor would
  // Treat an earlier in-flight deletion as stale and swallow both its rollback and its active-room navigation
  const deleteRoom = async (input: DeleteRoomInput) => {
    let isSuccessful = false;
    await executeDeleteRoomMutation(() => $trpc.room.deleteRoom.mutate(input), {
      // Restore only this room. Reinstating a whole-list snapshot would re-add a room another removal already
      // Took out and drop whatever arrived while this write was in flight — and the list is sorted for display,
      // So where the restored room lands in it is not observable
      applyOptimistic: () => {
        const deletedRoom = items.value.find(({ id }) => id === input);
        baseStoreDeleteRoom({ id: input });
        return () => {
          if (deletedRoom) storeCreateRoom(deletedRoom);
        };
      },
      key: input,
      onSuccess: async () => {
        isSuccessful = true;
        await navigateFromDeletedRoom(input);
      },
    });
    return isSuccessful;
  };
  const joinRoom = async (input: JoinRoomInput) => {
    await executeJoinRoomMutation(() => $trpc.room.joinRoom.mutate(input), {
      key: input,
      onSuccess: async (joinedRoom) => {
        storeCreateRoom(joinedRoom, true);
        await navigateTo(RoutePath.Messages(joinedRoom.id));
      },
    });
  };
  const leaveRoom = async (input: LeaveRoomInput) => {
    let isSuccessful = false;
    await executeLeaveRoomMutation(() => $trpc.room.leaveRoom.mutate(input), {
      applyOptimistic: () => {
        const deletedRoom = items.value.find(({ id }) => id === input);
        baseStoreDeleteRoom({ id: input });
        return () => {
          if (deletedRoom) storeCreateRoom(deletedRoom);
        };
      },
      // Keyed per room so leaving one room never queues behind another in-flight leave
      key: input,
      onSuccess: async () => {
        isSuccessful = true;
        await navigateFromDeletedRoom(input);
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
    getSlice,
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
    scopedRoomId,
  };
});
