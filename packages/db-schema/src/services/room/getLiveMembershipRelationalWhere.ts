import { getLiveRowWhere } from "#src/services/tombstone/getLiveRowWhere";

// The relational where of one user's live membership in one room, for a findFirst or a findMany over the membership table.
// It takes getLiveRowWhere, the one live filter, so no reader restates which membership rows count
export const getLiveMembershipRelationalWhere = (roomId: string, userId: string) => ({
  RAW: getLiveRowWhere,
  roomId: { eq: roomId },
  userId: { eq: userId },
});
