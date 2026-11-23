import type { MemberRow } from "#shared/models/db/room/MemberRow";
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

// The other side of one direct-message room. Read for many rooms at once and grouped here rather than per room,
// So a sidebar listing every conversation costs one query instead of one per row. A participant is the membership row
// A room's members read, with the user it belongs to: the same shape a join announces
export interface DirectMessageParticipants {
  participants: ({ user: PublicUser } & MemberRow)[];
  roomId: RoomInMessage["id"];
}
