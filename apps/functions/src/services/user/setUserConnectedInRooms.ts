import { getRoomObject } from "#src/services/room/getRoomObject";
import { readMemberRoomIds } from "#src/services/user/readMemberRoomIds";
import { upsertConnectedStatus } from "#src/services/user/upsertConnectedStatus";
import { getResultAsync, noop } from "@esposter/shared";

// A person comes online on their first socket and goes offline on their last. Their status is written first, so every
// room the person is in hears it with the status it now has. Each room is told on its own, so one room's failure costs
// that room the change alone
export const setUserConnectedInRooms = async (userId: string, isConnected: boolean): Promise<void> => {
  const status = await getResultAsync(() => upsertConnectedStatus(userId, isConnected)).match(
    (upsertedStatus) => upsertedStatus,
    (error) => {
      console.error("UserStatus failed to upsert", { error, userId });
      return undefined;
    },
  );
  if (!status) return;

  const roomIds = await readMemberRoomIds(userId);
  await Promise.all(
    roomIds.map((roomId) =>
      getResultAsync(() =>
        isConnected
          ? getRoomObject(roomId).attachMember(userId, status)
          : getRoomObject(roomId).detachMember(userId, status),
      ).match(noop, (error) => {
        console.error("UserStatus failed to reach room", { error, roomId, userId });
      }),
    ),
  );
};
