import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";

// A user as a room names them. Once a user has left the room, the name they are shown by is their account name, and
// `isMember` is what tells their row from a member's
export interface UserInRoom extends MemberInRoom {
  isMember: boolean;
}
