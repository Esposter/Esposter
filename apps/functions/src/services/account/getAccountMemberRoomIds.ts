import type { RoomInMessage, UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { usersToRoomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The rooms the account is a member of. Read after the rooms it owned are deleted, which removes their memberships, so
// What is left is the rooms it is still in
export const getAccountMemberRoomIds = async (userId: UserInAuth["id"]): Promise<RoomInMessage["id"][]> => {
  const memberRooms = await db
    .select({ roomId: usersToRoomsInMessage.roomId })
    .from(usersToRoomsInMessage)
    .where(eq(usersToRoomsInMessage.userId, userId));
  return memberRooms.map(({ roomId }) => roomId);
};
