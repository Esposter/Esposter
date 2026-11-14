import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { RoomActor } from "@esposter/db-schema";

import { readDeviceId } from "#server/services/realtime/readDeviceId";

// The actor a room object's write is made as: the signed-in person, and the browser tab that made the write when the
// Header names one. A missing or malformed header names no tab, so the write's echo reaches every socket, which the
// Client absorbs by id
export const getRoomActor = ({ headers, user }: Pick<AuthedContext, "headers" | "user">): RoomActor => {
  const deviceId = readDeviceId(headers);
  return deviceId ? { deviceId, userId: user.id } : { userId: user.id };
};
