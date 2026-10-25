import type { InvocationContext } from "@azure/functions";
import type { UserInAuth } from "@esposter/db-schema";

import { deleteAccountOwnedRoom } from "#src/services/account/deleteAccountOwnedRoom";
import { db } from "#src/services/shared/db";
import { roomsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// Every room the account owns is deleted in turn. A room whose sweep fails stops the run with its row still in place,
// So the redelivery finds it again
export const deleteAccountOwnedRooms = async (context: InvocationContext, userId: UserInAuth["id"]): Promise<void> => {
  const ownedRooms = await db
    .select({ id: roomsInMessage.id })
    .from(roomsInMessage)
    .where(eq(roomsInMessage.userId, userId));
  for (const { id: roomId } of ownedRooms)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one room at a time, each fanning out across its own partitions and blobs
    await deleteAccountOwnedRoom(context, roomId);
};
