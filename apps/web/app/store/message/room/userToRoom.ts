import type { UpdateUserToRoomInput } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import type { UserToRoomInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { userToRoomTable } from "#src/services/message/userToRoom/constants";
import { getUserToRoomPatchEntry } from "#src/services/message/userToRoom/getUserToRoomPatchEntry";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createHeaderConfirmations } from "#src/services/shared/overlay/createHeaderConfirmations";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useOverlayStore } from "#src/store/overlay";
import { omitUndefined } from "@esposter/shared";

export const useUserToRoomStore = defineStore("message/room/userToRoom", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const userToRooms = view(userToRoomTable);
  // The viewer's own memberships by room. A membership the viewer has left is a tombstone, which the view leaves out, so
  // The room has no row here
  const myMembershipMap = computed(
    () =>
      new Map(
        userToRooms.value
          .filter((userToRoom) => checkIsVersioned(userToRoom))
          .flatMap((userToRoom) =>
            userToRoom.userId === userId.value ? [[userToRoom.roomId, userToRoom] as const] : [],
          ),
      ),
  );
  const getMyUserToRoom = (roomId: UserToRoomInMessage["roomId"]) => myMembershipMap.value.get(roomId);
  const myUserToRoom = computed(() => getMyUserToRoom(roomStore.currentRoomId));
  // Reads and events carry the rows as they stand, tombstones included, so each one arrives at its version
  const arriveUserToRooms = (rows: UserToRoomInMessage[]) => {
    for (const row of rows) arrive(userToRoomTable, row);
  };
  // The viewer's row takes the fields the write sets at once. The server's row and its header confirm it, and a
  // Rejected write leaves the row as it was
  const updateMyUserToRoom = (input: Except<UpdateUserToRoomInput, "targetUserId">) => {
    const { roomId, ...patch } = input;
    writeOptimistic(
      async () => {
        const { result, rowVersions } = await collectRowVersions(() => $trpc.userToRoom.updateUserToRoom.mutate(input));
        return {
          arrivals: [createArrival(userToRoomTable, result)],
          confirmed: createHeaderConfirmations(userToRoomTable, rowVersions),
        };
      },
      { entry: getUserToRoomPatchEntry(userId.value, roomId, omitUndefined(patch)), onError: createErrorAlert },
    );
  };

  return { arriveUserToRooms, getMyUserToRoom, myUserToRoom, updateMyUserToRoom };
});
