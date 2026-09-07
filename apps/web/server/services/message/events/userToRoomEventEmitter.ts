import type { UserToRoomInMessage } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface UserToRoomEvents {
  updateUserToRoom: [UserToRoomInMessage];
}

export const userToRoomEventEmitter = new EventEmitter<UserToRoomEvents>();
