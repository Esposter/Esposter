import { getLiveMembershipWhere, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// The live membership row one user holds in one room — the row a leave, kick, ban, timeout or hide lands on. A removed
// Membership is a tombstone, so the removal and every write after it find no row
export const getRoomMembershipWhere = (roomId: string, userId: string) =>
  and(
    eq(usersToRoomsInMessage.roomId, roomId),
    eq(usersToRoomsInMessage.userId, userId),
    getLiveMembershipWhere(usersToRoomsInMessage),
  );
