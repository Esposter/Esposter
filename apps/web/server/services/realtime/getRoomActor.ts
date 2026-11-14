import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { RoomActor } from "@esposter/db-schema";

import { DEVICE_ID_HEADER, deviceIdSchema } from "#shared/models/realtime/DeviceId";

// The actor a room object's write is made as: the signed-in person, and the browser tab that made the write when the
// header names one. A missing or malformed header names no tab, so the write's echo reaches every socket, which the
// client absorbs by id
export const getRoomActor = ({ user }: GetSessionPayload, headers: Headers): RoomActor => {
  const { data, success } = deviceIdSchema.safeParse({ deviceId: headers.get(DEVICE_ID_HEADER) });
  return success ? { deviceId: data.deviceId, userId: user.id } : { userId: user.id };
};
