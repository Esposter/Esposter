import type { IUserStatus } from "#shared/db/schema/userStatuses";
import type { UserToRoom, UserToRoomWithRelations } from "#shared/db/schema/usersToRooms";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { UpdateRoomInput } from "#shared/models/db/room/UpdateRoomInput";
import type { DeviceId } from "@@/server/models/auth/DeviceId";

import { EventEmitter } from "node:events";

interface RoomEvents {
  deleteRoom: DeleteRoomInput[];
  joinRoom: (Pick<DeviceId, "sessionId"> & Pick<UserToRoomWithRelations, "roomId" | "user">)[];
  leaveRoom: (Pick<DeviceId, "sessionId"> & UserToRoom)[];
  updateRoom: UpdateRoomInput[];
  updateStatus: (Partial<Pick<IUserStatus, "status">> & Pick<UserToRoom, "userId">)[];
}

export const roomEventEmitter = new EventEmitter<RoomEvents>();
