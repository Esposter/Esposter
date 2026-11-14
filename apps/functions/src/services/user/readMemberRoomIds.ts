import { db } from "#src/services/shared/db";
import { usersToRoomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Every room the person is a member of, which is the set of room objects their presence is reported to
export const readMemberRoomIds = async (userId: string): Promise<string[]> =>
  (
    await db
      .select({ roomId: usersToRoomsInMessage.roomId })
      .from(usersToRoomsInMessage)
      .where(eq(usersToRoomsInMessage.userId, userId))
  ).map(({ roomId }) => roomId);
