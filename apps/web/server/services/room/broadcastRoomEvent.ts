import type { RoomActor, RoomEvent } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { getResultAsync, noop } from "@esposter/shared";

// A room event a D1 write of the room raised, sent to the room's viewers. The tab that made the write is not sent its
// echo, so the object skips the socket that carries the actor's device. Settled on its own, so a failure costs the
// viewers the event and never the write that raised it
export const broadcastRoomEvent = (roomId: string, event: RoomEvent, { deviceId }: RoomActor): Promise<void> =>
  getResultAsync(() =>
    useRoomObject(roomId).broadcastEvent(event, deviceId === undefined ? {} : { excludeTag: `device:${deviceId}` }),
  ).match(noop, (error) => {
    console.error("A room event failed to reach the room's viewers", { error, roomId });
  });
