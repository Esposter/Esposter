import { clearAccountModerationActor } from "#src/services/account/clearAccountModerationActor";
import { deleteAccountBlobDirectories } from "#src/services/account/deleteAccountBlobDirectories";
import { deleteAccountChargedBlobs } from "#src/services/account/deleteAccountChargedBlobs";
import { deleteAccountDataExportArchives } from "#src/services/account/deleteAccountDataExportArchives";
import { deleteAccountMemberRoomReactions } from "#src/services/account/deleteAccountMemberRoomReactions";
import { deleteAccountOwnedResources } from "#src/services/account/deleteAccountOwnedResources";
import { deleteAccountOwnedRooms } from "#src/services/account/deleteAccountOwnedRooms";
import { eraseAccountMessages } from "#src/services/account/eraseAccountMessages";
import { eraseAccountUserObject } from "#src/services/account/eraseAccountUserObject";
import { eraseAccountUserRow } from "#src/services/account/eraseAccountUserRow";
import { removeAccountFromMemberRooms } from "#src/services/account/removeAccountFromMemberRooms";
import { deleteAccountQueueMessageSchema } from "@esposter/db-schema";

// The account deletion sweep, in the order each store depends on. Every step treats an already-gone target as done, so
// A run that fails anywhere is finished by the next one, and the message names the account by its user id, so a retry
// Runs every step again from the top. The user row goes last: deleting it earlier would cascade away the only record of
// What still needs sweeping, and the cascade from it removes whatever no step above names. Each step's rows are
// Published by the unit the message runs in, and each object's writes by its own invoke, whether the run succeeded or
// Not, so a reader of a row is told by the run that removed it
export const deleteAccountHandler = async (body: unknown): Promise<void> => {
  const { userId } = deleteAccountQueueMessageSchema.parse(body);
  await deleteAccountOwnedRooms(userId);
  await deleteAccountOwnedResources(userId);
  await eraseAccountMessages(userId);
  await deleteAccountMemberRoomReactions(userId);
  await removeAccountFromMemberRooms(userId);
  await eraseAccountUserObject(userId);
  await deleteAccountChargedBlobs(userId);
  await deleteAccountBlobDirectories(userId);
  await deleteAccountDataExportArchives(userId);
  await clearAccountModerationActor(userId);
  await eraseAccountUserRow(userId);
};
