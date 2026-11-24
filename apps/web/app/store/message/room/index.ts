import type { CreateRoomInput } from "#shared/models/db/room/CreateRoomInput";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { JoinRoomInput } from "#shared/models/db/room/JoinRoomInput";
import type { LeaveRoomInput } from "#shared/models/db/room/LeaveRoomInput";
import type { CursorPaginationSlice } from "#src/models/pagination/cursor/CursorPaginationSlice";
import type { RoomInMessage, UpdateRoomInput } from "@esposter/db-schema";

import { checkIsUuidV7 } from "#shared/services/id/checkIsUuidV7";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { authClient } from "#src/services/auth/authClient";
import { compareLastMessageAtDescending } from "#src/services/message/room/compareLastMessageAtDescending";
import { roomTable } from "#src/services/message/room/constants";
import { getRoomPatchEntry } from "#src/services/message/room/getRoomPatchEntry";
import { userToRoomTable } from "#src/services/message/userToRoom/constants";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomDialogStore } from "#src/store/message/room/dialog";
import { useOverlayStore } from "#src/store/overlay";
import { getRouteParam } from "#src/util/router/getRouteParam";
import { RoomType } from "@esposter/db-schema";
import { omitUndefined, RoutePath } from "@esposter/shared";

export const useRoomStore = defineStore("message/room", () => {
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeAwaited, writeOptimistic } = overlayStore;
  // The cursor keeps the ids of the last page, for paging. The rows are the overlay's, read into it as each page
  // Answers
  const {
    getSlice: getPageSlice,
    items: _pageRoomIds,
    ...restData
  } = useCursorPaginationData<Pick<RoomInMessage, "id">>();
  const roomRows = view(roomTable);
  const userToRooms = view(userToRoomTable);
  const userId = useSessionUserId();
  // The rooms the viewer holds a live membership of. A membership a removal tombstoned is not in the view, so its room
  // Leaves the list with it, whichever read or event brought the removal
  const myRoomIds = computed(
    () =>
      new Set(
        userToRooms.value.flatMap((userToRoom) =>
          checkIsVersioned(userToRoom) && userToRoom.userId === userId.value ? [userToRoom.roomId] : [],
        ),
      ),
  );
  const rooms = computed(() =>
    roomRows.value
      .flatMap((room) =>
        checkIsVersioned(room) && room.type === RoomType.Room && myRoomIds.value.has(room.id) ? [room] : [],
      )
      .toSorted(compareLastMessageAtDescending),
  );
  // Reads and events hand over rows as they stand, tombstones included, so each one arrives at its version
  const arriveRooms = (newRooms: RoomInMessage[]) => {
    for (const room of newRooms) arrive(roomTable, room);
  };
  // The offline cache persists and restores the rows the list shows, so its slice holds rows: a cached page arrives
  // Each row at its version, and the page's ids follow them, since the cursor keeps only the ids of its pages
  const getSlice = (): CursorPaginationSlice<RoomInMessage> => {
    const { initializeCursorPaginationData, isLoaded, resetCursorPaginationData } = getPageSlice();
    return {
      initializeCursorPaginationData: (page) => {
        arriveRooms(page.items);
        initializeCursorPaginationData({ ...page, items: page.items.map(({ id }) => ({ id })) });
      },
      isLoaded,
      items: rooms,
      resetCursorPaginationData,
    };
  };
  const { currentRoute } = useRouter();
  const currentRoomId = computed(() => {
    const roomId = getRouteParam(currentRoute.value.params, "id");
    return checkIsUuidV7(roomId) ? roomId : "";
  });
  const roomDialogStore = useRoomDialogStore();
  // Which room the room-scoped surfaces are reading for. The route decides it, except while room settings is open
  // Over another room: the dialog names its own room, and its panels read the same keyed slices the room list and
  // The message list do — so without this the cog would have to navigate first, which is a flicker and a place
  // The reader never asked to go
  const scopedRoomId = computed(() => roomDialogStore.settingsRoomId || currentRoomId.value);
  const currentRoom = computed(() => {
    if (currentRoomId.value) return rooms.value.find(({ id }) => id === currentRoomId.value);
    else return undefined;
  });
  const session = authClient.useSession();
  const isCreator = computed(() => currentRoom.value?.userId === session.value.data?.user.id);
  // A room the viewer has just joined or created is listed by its membership, which the server answers apart from the
  // Room
  const readMyMembershipArrivals = async (roomId: RoomInMessage["id"]) => {
    const [userToRoom] = await $trpc.userToRoom.readMyUsersToRooms.query({ roomIds: [roomId] });
    return userToRoom ? [createArrival(userToRoomTable, userToRoom)] : [];
  };
  const isJoinRoomPending = ref(false);
  // The room's id is the server's, so the room is drawn once the server answers with it
  // The room list changes only once the server answers, so the create button holds its pending state until then
  const isCreateRoomPending = ref(false);
  const createRoom = async (input: CreateRoomInput) => {
    isCreateRoomPending.value = true;
    await writeAwaited(
      async () => {
        const newRoom = await $trpc.room.createRoom.mutate(input);
        return [createArrival(roomTable, newRoom), ...(await readMyMembershipArrivals(newRoom.id))];
      },
      { awaitedBecause: AwaitedReason.ServerIssuedValue, onError: createErrorAlert },
    );
    isCreateRoomPending.value = false;
  };
  const joinRoom = async (input: JoinRoomInput) => {
    let joinedRoomId = "";
    isJoinRoomPending.value = true;
    await writeAwaited(
      async () => {
        const joinedRoom = await $trpc.room.joinRoom.mutate(input);
        joinedRoomId = joinedRoom.id;
        return [createArrival(roomTable, joinedRoom), ...(await readMyMembershipArrivals(joinedRoom.id))];
      },
      { awaitedBecause: AwaitedReason.ServerIssuedValue, onError: createErrorAlert },
    );
    isJoinRoomPending.value = false;
    if (joinedRoomId) await navigateTo(RoutePath.Messages(joinedRoomId));
  };
  // A leave and a deletion are awaited, so the room leaves the list when the server answers with the membership it
  // Tombstoned. The page the reader is on is taken off the room by the removal that the list shows
  const leaveRoom = (input: LeaveRoomInput) =>
    writeAwaited(async () => [createArrival(userToRoomTable, await $trpc.room.leaveRoom.mutate(input))], {
      awaitedBecause: AwaitedReason.ServerDecidedOutcome,
      onError: createErrorAlert,
    });
  const deleteRoom = (input: DeleteRoomInput) =>
    writeAwaited(async () => [createArrival(userToRoomTable, await $trpc.room.deleteRoom.mutate(input))], {
      awaitedBecause: AwaitedReason.IrreversibleStep,
      onError: createErrorAlert,
    });
  // A write to the room's fields shows at once and is confirmed by the row the server answers with
  const updateRoom = (input: UpdateRoomInput) => {
    const { id, ...patch } = input;
    writeOptimistic(async () => createRowResponse(roomTable, await $trpc.room.updateRoom.mutate(input)), {
      entry: getRoomPatchEntry(id, omitUndefined(patch)),
      onError: createErrorAlert,
    });
  };

  return {
    arriveRooms,
    createRoom,
    currentRoom,
    currentRoomId,
    deleteRoom,
    getSlice,
    isCreateRoomPending,
    isCreator,
    isJoinRoomPending,
    joinRoom,
    leaveRoom,
    rooms,
    scopedRoomId,
    updateRoom,
    ...restData,
  };
});
