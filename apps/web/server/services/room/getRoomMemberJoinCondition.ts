import { usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// The join from an account to its membership row in one room, left-joined so an account with no membership still returns
export const getRoomMemberJoinCondition = (roomId: string) =>
  and(eq(usersToRoomsInMessage.userId, usersInAuth.id), eq(usersToRoomsInMessage.roomId, roomId));
