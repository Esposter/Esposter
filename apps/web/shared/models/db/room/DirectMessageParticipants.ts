import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { RoomInMessage } from "@esposter/db-schema";

// The other side of one direct-message room. Read for many rooms at once and grouped here rather than per room,
// So a sidebar listing every conversation costs one query instead of one per row.
export interface DirectMessageParticipants {
  // A participant in a direct message is a member of its room, so it has the member's shape
  participants: MemberInRoom[];
  roomId: RoomInMessage["id"];
}
