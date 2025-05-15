import type { UserToRoom, UserToRoomWithRelations } from "#shared/db/schema/users";
import type { DeleteRoomInput } from "#shared/models/db/room/DeleteRoomInput";
import type { UpdateRoomInput } from "#shared/models/db/room/UpdateRoomInput";

import { EventEmitter } from "node:events";

interface RoomEvents {
  deleteRoom: DeleteRoomInput[];
  joinRoom: Pick<UserToRoomWithRelations, "roomId" | "user">[];
  leaveRoom: UserToRoom[];
  updateRoom: UpdateRoomInput[];
}

export const roomEventEmitter = new EventEmitter<RoomEvents>();
