import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { MemberRow } from "#shared/models/db/room/MemberRow";

// A member as a room's read returns one: the user's public columns and the membership's row, removed or not
export type MemberRowInRoom = MemberInRoom & MemberRow;
