import type { Database } from "@esposter/db-schema";

import { usersToRoomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Every member of the room, read before the room's memberships go with it, so the room's deletion can reach each member's
// Own object for what it holds for the room
export const getRoomMemberIds = async (db: Database, roomId: string): Promise<string[]> => {
  const members = await db
    .select({ userId: usersToRoomsInMessage.userId })
    .from(usersToRoomsInMessage)
    .where(eq(usersToRoomsInMessage.roomId, roomId));
  return members.map(({ userId }) => userId);
};
