import type { Device } from "#shared/models/auth/Device";
import type { UpdateRoomInput } from "#shared/models/db/room/UpdateRoomInput";
import type { UserToRoomInMessage, UserToRoomInMessageWithRelations } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface RoomEvents {
  deleteRoom: [Pick<Device, "sessionId"> & Pick<UserToRoomInMessage, "roomId" | "userId">];
  joinRoom: [Pick<Device, "sessionId"> & Pick<UserToRoomInMessageWithRelations, "roomId" | "user">];
  leaveRoom: [Pick<Device, "sessionId"> & Pick<UserToRoomInMessage, "roomId" | "userId">];
  updateRoom: [UpdateRoomInput];
}

export const roomEventEmitter = new EventEmitter<RoomEvents>();
