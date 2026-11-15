import type { UserToRoomInMessage } from "@esposter/db-schema";

import { callUserObjects } from "#server/services/realtime/callUserObjects";

// Each member a mention count moved hears of its new count through their own object, so the chip shows the change with no
// New subscription
export const notifyMentionCounts = async (rows: UserToRoomInMessage[]): Promise<void> => {
  await Promise.all(rows.map((row) => callUserObjects([row.userId], (userObject) => userObject.updateUserToRoom(row))));
};
