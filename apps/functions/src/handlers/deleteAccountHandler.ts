import { deleteAccountBlobDirectories } from "#src/services/account/deleteAccountBlobDirectories";
import { deleteAccountChargedBlobs } from "#src/services/account/deleteAccountChargedBlobs";
import { deleteAccountDataExportArchives } from "#src/services/account/deleteAccountDataExportArchives";
import { deleteAccountMemberRoomReactions } from "#src/services/account/deleteAccountMemberRoomReactions";
import { deleteAccountOwnedResources } from "#src/services/account/deleteAccountOwnedResources";
import { clearAccountModerationActor } from "#src/services/account/clearAccountModerationActor";
import { deleteAccountOwnedRooms } from "#src/services/account/deleteAccountOwnedRooms";
import { eraseAccountMessages } from "#src/services/account/eraseAccountMessages";
import { db } from "#src/services/shared/db";
import { deleteAccountQueueMessageSchema, usersInAuth } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The account deletion sweep, in the order each store depends on. Every step treats an already-gone target as done, so a
// Run that fails anywhere is finished by the next one, and the message names the account by its user id, so a retry runs
// Every step again from the top. The user row goes last: deleting it earlier would cascade away the only record of what
// Still needs sweeping, and the cascade from it removes whatever no step above names
export const deleteAccountHandler = async (body: unknown): Promise<void> => {
  const { userId } = deleteAccountQueueMessageSchema.parse(body);
  await deleteAccountOwnedRooms(userId);
  await deleteAccountOwnedResources(userId);
  await eraseAccountMessages(userId);
  await deleteAccountMemberRoomReactions(userId);
  await deleteAccountChargedBlobs(userId);
  await deleteAccountBlobDirectories(userId);
  await deleteAccountDataExportArchives(userId);
  await clearAccountModerationActor(userId);
  await db.delete(usersInAuth).where(eq(usersInAuth.id, userId));
};
