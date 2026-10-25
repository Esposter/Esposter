import type { InvocationContext } from "@azure/functions";
import type { UserInAuth } from "@esposter/db-schema";

import { deleteAccountBlobDirectories } from "#src/services/account/deleteAccountBlobDirectories";
import { deleteAccountChargedBlobs } from "#src/services/account/deleteAccountChargedBlobs";
import { deleteAccountMemberRoomReactions } from "#src/services/account/deleteAccountMemberRoomReactions";
import { deleteAccountOwnedResources } from "#src/services/account/deleteAccountOwnedResources";
import { deleteAccountOwnedRooms } from "#src/services/account/deleteAccountOwnedRooms";
import { softDeleteAccountMessages } from "#src/services/account/softDeleteAccountMessages";
import { db } from "#src/services/shared/db";
import { usersInAuth } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The account deletion sweep, in the order each store depends on. Every step treats an already-gone target as done, so a
// Run that fails anywhere is finished by the next one, and the event names the account by its user id, so a replay runs
// Every step again from the top. The user row goes last: deleting it earlier would cascade away the only record of what
// Still needs sweeping, and the cascade from it removes whatever no step above names
export const deleteAccountHandler = async (context: InvocationContext, userId: UserInAuth["id"]): Promise<void> => {
  await deleteAccountOwnedRooms(context, userId);
  await deleteAccountOwnedResources(context, userId);
  await softDeleteAccountMessages(userId);
  await deleteAccountMemberRoomReactions(userId);
  await deleteAccountChargedBlobs(context, userId);
  await deleteAccountBlobDirectories(userId);
  await db.delete(usersInAuth).where(eq(usersInAuth.id, userId));
};
