import type { CreateRoomInput } from "#shared/models/db/room/CreateRoomInput";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { JoinRoomInput } from "#shared/models/db/room/JoinRoomInput";
import type { LeaveRoomInput } from "#shared/models/db/room/LeaveRoomInput";
import type { RoomInMessage } from "@esposter/db-schema";

import { checkIsUuidV7 } from "#shared/services/id/checkIsUuidV7";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { authClient } from "#src/services/auth/authClient";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { createOperationData } from "#src/services/shared/createOperationData";
import { useRoomDialogStore } from "#src/store/message/room/dialog";
import { getRouteParam } from "#src/util/router/getRouteParam";
import { DatabaseEntityType, MessageType } from "@esposter/db-schema";
import { getSynchronizedFunction, Operation, RoutePath, takeOne } from "@esposter/shared";

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
    items.value.toSorted(
      (firstRoom, secondRoom) => secondRoom.lastMessageAt.getTime() - firstRoom.lastMessageAt.getTime(),
    ),
  );
  const router = useRouter();
  const currentRoomId = computed(() => {
    const roomId = getRouteParam(router.currentRoute.value.params, "id");
    return checkIsUuidV7(roomId) ? roomId : "";
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
    if (currentRoomId.value) return rooms.value.find(({ id }) => id === currentRoomId.value);
    else return undefined;
  });
  const session = authClient.useSession();
  const isCreator = computed(() => currentRoom.value?.userId === session.value.data?.user.id);

  const { executeMutation: executeCreateRoomMutation } = useMutation();
  const { executeMutation: executeJoinRoomMutation, isPending: isJoinRoomPending } = useMutation();
  const { executeMutation: executeLeaveRoomMutation } = useMutation();
  const { executeMutation: executeDeleteRoomMutation } = useMutation();
  const createRoom = async (input: CreateRoomInput) => {
    await executeCreateRoomMutation(() => $trpc.room.createRoom.mutate(input), {
      // The room's id is the server's, so the room is drawn once the server answers with it. A later phase gives creates
      // A client id to draw from
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: Symbol("createRoom"),
      onSuccess: (newRoom) => {
        storeCreateRoom(newRoom, true);
      },
    });
  };
  // Started rather than awaited, so the removal's apply can navigate as the write is sent
  const navigateFromDeletedRoomInBackground = getSynchronizedFunction(navigateFromDeletedRoom);
  const navigateToRoomInBackground = getSynchronizedFunction(async (roomId: string) => {
    await navigateTo(RoutePath.Messages(roomId), { replace: true });
  });
  // A room leaving the list, whether it was deleted or left: the room goes at once, the reader is navigated off it in the
  // Same step, and a failure puts back only this room, and the reader into it unless they have moved on from where the
  // Removal sent them. The list is sorted for display, so where the room lands in it is not observable. Keyed per room,
  // Since rooms are deleted and left independently: an unkeyed executor would treat an earlier in-flight removal as stale
  // And swallow both its rollback and its navigation
  const getRoomRemovalOptions = (roomId: string) => ({
    applyOptimistic: () => {
      const removedRoom = items.value.find(({ id }) => id === roomId);
      const isCurrent = currentRoomId.value === roomId;
      baseStoreDeleteRoom({ id: roomId });
      const landingRoomId = rooms.value.length > 0 ? takeOne(rooms.value).id : "";
      navigateFromDeletedRoomInBackground(roomId);
      return () => {
        if (removedRoom) storeCreateRoom(removedRoom);
        if (isCurrent && currentRoomId.value === landingRoomId) navigateToRoomInBackground(roomId);
      };
    },
    key: roomId,
  });
  const deleteRoom = (input: DeleteRoomInput) => {
    executeDeleteRoomMutation(() => $trpc.room.deleteRoom.mutate(input), getRoomRemovalOptions(input));
  };
  const joinRoom = async (input: JoinRoomInput) => {
    await executeJoinRoomMutation(() => $trpc.room.joinRoom.mutate(input), {
      // The room is the server's to name from the code, so it is drawn once the server answers with it
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: input,
      onSuccess: async (joinedRoom) => {
        storeCreateRoom(joinedRoom, true);
        await navigateTo(RoutePath.Messages(joinedRoom.id));
      },
    });
  };
  const leaveRoom = (input: LeaveRoomInput) => {
    executeLeaveRoomMutation(() => $trpc.room.leaveRoom.mutate(input), getRoomRemovalOptions(input));
  };
  MessageHookMap[Operation.Create].register(({ message, roomId, type }) => {
    if (type !== MessageType.EditRoom) return;
    storeUpdateRoom({ id: roomId, name: message });
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
    isJoinRoomPending,
    scopedRoomId,
  };
});
