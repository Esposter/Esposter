import { db } from "#src/services/shared/db";
import { getMemberRoomIds } from "@esposter/db";
import { getResultAsync, noop } from "@esposter/shared";

// Each room the person is a member of is reached on its own, so one room's failure costs only that room its change
export const reachMemberRooms = async (userId: string, reach: (roomId: string) => Promise<unknown>): Promise<void> => {
  const roomIds = await getMemberRoomIds(db, userId);
  await Promise.all(
    roomIds.map((roomId) =>
      getResultAsync(() => reach(roomId)).match(noop, (error) => {
        console.error("UserStatus failed to reach room", { error, roomId, userId });
      }),
    ),
  );
};
