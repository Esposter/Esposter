import type { DeviceId } from "#shared/models/auth/DeviceId";
import type { UpdateRoomInput } from "#shared/models/db/room/UpdateRoomInput";
import type { UserToRoom, UserToRoomWithRelations } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface RoomEvents {
  deleteRoom: (Pick<DeviceId, "sessionId"> & UserToRoom)[];
  joinRoom: (Pick<DeviceId, "sessionId"> & Pick<UserToRoomWithRelations, "roomId" | "user">)[];
  leaveRoom: (Pick<DeviceId, "sessionId"> & UserToRoom)[];
  updateRoom: UpdateRoomInput[];
}

export const roomEventEmitter = new EventEmitter<RoomEvents>();
