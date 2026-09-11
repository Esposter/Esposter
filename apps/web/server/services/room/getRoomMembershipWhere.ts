import { usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";
// The membership row one user holds in one room — the row a leave, kick, ban, timeout or hide lands on
export const getRoomMembershipWhere = (roomId: string, userId: string) =>
  and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId));
