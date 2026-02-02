import type { Device } from "#shared/models/auth/Device";
import type { UpdateRoomInput } from "#shared/models/db/room/UpdateRoomInput";
import type { UserToRoom, UserToRoomWithRelations } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface RoomEvents {
  deleteRoom: [Pick<Device, "sessionId"> & Pick<UserToRoom, "roomId" | "userId">];
  joinRoom: [Pick<Device, "sessionId"> & Pick<UserToRoomWithRelations, "roomId" | "user">];
  leaveRoom: [Pick<Device, "sessionId"> & Pick<UserToRoom, "roomId" | "userId">];
  updateRoom: [UpdateRoomInput];
}

export const roomEventEmitter = new EventEmitter<RoomEvents>();
