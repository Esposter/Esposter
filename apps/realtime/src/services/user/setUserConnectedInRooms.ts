import { getRoomObject } from "#src/services/room/getRoomObject";
import { reachMemberRooms } from "#src/services/user/reachMemberRooms";
import { upsertConnectedStatus } from "#src/services/user/upsertConnectedStatus";
import { getResultAsync } from "@esposter/shared";

// A person comes online on their first socket and goes offline on their last.
// Their status is written first, so every room the person is in hears it with the status it now has.
export const setUserConnectedInRooms = async (userId: string, isConnected: boolean): Promise<void> => {
  const status = await getResultAsync(() => upsertConnectedStatus(userId, isConnected)).match(
    (upsertedStatus) => upsertedStatus,
    (error) => {
      console.error("UserStatus failed to upsert", { error, userId });
      return undefined;
    },
  );
  if (!status) return;

  await reachMemberRooms(userId, (roomId) =>
    isConnected
      ? getRoomObject(roomId).attachMember(userId, status)
      : getRoomObject(roomId).detachMember(userId, status),
  );
};
