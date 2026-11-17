import type { Database } from "@esposter/db-schema";

import { usersToRoomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Every room the person is a member of, which is the set of room objects their presence is reported to. A membership
// Is removed with its room, so a read made after the rooms the person owned are deleted sees only the rooms they are
// Still in
export const getMemberRoomIds = async (db: Database, userId: string): Promise<string[]> => {
  const memberRooms = await db
    .select({ roomId: usersToRoomsInMessage.roomId })
    .from(usersToRoomsInMessage)
    .where(eq(usersToRoomsInMessage.userId, userId));
  return memberRooms.map(({ roomId }) => roomId);
};
