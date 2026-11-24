import type { MemberRow } from "#shared/models/db/room/MemberRow";

// The columns of a membership a member may read, taken from a row a read, an answer or an event carries. A row that
// Also carries the user beside it, or the membership's private columns, holds only these in the overlay
export const toMemberRow = ({ deletedAt, displayName, roomId, userId, version }: MemberRow): MemberRow => ({
  deletedAt,
  displayName,
  roomId,
  userId,
  version,
});
