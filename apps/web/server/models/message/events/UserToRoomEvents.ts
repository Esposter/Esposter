import type { UserToRoomInMessage } from "@esposter/db-schema";

export interface UserToRoomEvents {
  updateUserToRoom: [UserToRoomInMessage];
}
