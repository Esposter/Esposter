import type { RoomInMessage, User } from "@esposter/db-schema";

// The other side of one direct-message room. Read for many rooms at once and grouped here rather than per room,
// So a sidebar listing every conversation costs one query instead of one per row.
export interface DirectMessageParticipants {
  participants: User[];
  roomId: RoomInMessage["id"];
}
