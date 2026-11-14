import type { RoomActor } from "@esposter/db-schema";

// The send options a write's room event is given: the tab that made the write is not sent its own echo. An actor with
// No device names no tab, so the echo reaches every socket and the client absorbs it by id
export const getRoomEventOptions = ({ deviceId }: RoomActor): { excludeTag?: string } =>
  deviceId === undefined ? {} : { excludeTag: `device:${deviceId}` };
