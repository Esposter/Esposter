import type { UserObjectRpc } from "@esposter/db-schema";

import { getRoomObject } from "#src/services/room/getRoomObject";
import { readMemberRoomIds } from "#src/services/user/readMemberRoomIds";
import { getResultAsync, noop } from "@esposter/shared";

// A status the person sets is shown in every room they are in, so each room is told on its own, and one room's failure
// costs that room the change alone
export const setUserStatusInRooms = async (status: Parameters<UserObjectRpc["upsertStatus"]>[0]): Promise<void> => {
  const roomIds = await readMemberRoomIds(status.userId);
  await Promise.all(
    roomIds.map((roomId) =>
      getResultAsync(() => getRoomObject(roomId).setMemberStatus(status)).match(noop, (error) => {
        console.error("UserStatus failed to reach room", { error, roomId, userId: status.userId });
      }),
    ),
  );
};
