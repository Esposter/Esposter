import type { UserObjectRpc } from "@esposter/db-schema";

import { getRoomObject } from "#src/services/room/getRoomObject";
import { reachMemberRooms } from "#src/services/user/reachMemberRooms";

// A status the person sets is shown in every room they are in
export const setUserStatusInRooms = async (status: Parameters<UserObjectRpc["upsertStatus"]>[0]): Promise<void> => {
  await reachMemberRooms(status.userId, (roomId) => getRoomObject(roomId).setMemberStatus(status));
};
