import { clearAccountModerationActor } from "#src/services/account/clearAccountModerationActor";
import { MAX_CONCURRENT_ACCOUNT_TOPIC_PUBLISHES } from "#src/services/account/constants";
import { deleteAccountBlobDirectories } from "#src/services/account/deleteAccountBlobDirectories";
import { deleteAccountChargedBlobs } from "#src/services/account/deleteAccountChargedBlobs";
import { deleteAccountDataExportArchives } from "#src/services/account/deleteAccountDataExportArchives";
import { deleteAccountMemberRoomReactions } from "#src/services/account/deleteAccountMemberRoomReactions";
import { deleteAccountOwnedResources } from "#src/services/account/deleteAccountOwnedResources";
import { deleteAccountOwnedRooms } from "#src/services/account/deleteAccountOwnedRooms";
import { eraseAccountMessages } from "#src/services/account/eraseAccountMessages";
import { eraseAccountUserObject } from "#src/services/account/eraseAccountUserObject";
import { eraseAccountUserRow } from "#src/services/account/eraseAccountUserRow";
import { getAccountTopics } from "#src/services/account/getAccountTopics";
import { removeAccountFromMemberRooms } from "#src/services/account/removeAccountFromMemberRooms";
import { publishTopicsBestEffort } from "#src/services/realtime/publishTopicsBestEffort";
import { deleteAccountQueueMessageSchema } from "@esposter/db-schema";
import { settleAll, withFinalizerAsync } from "@esposter/shared";

// The account deletion sweep, in the order each store depends on. Every step treats an already-gone target as done, so a
// Run that fails anywhere is finished by the next one, and the message names the account by its user id, so a retry runs
// Every step again from the top. The user row goes last: deleting it earlier would cascade away the only record of what
// Still needs sweeping, and the cascade from it removes whatever no step above names
// The readers of the person's rows are named before any step removes one, and published when the sweep ends or fails part
// Way, so a reader is told even by the run that failed. A replay finds the removed rows gone, so it could not name them
export const deleteAccountHandler = async (body: unknown): Promise<void> => {
  const { userId } = deleteAccountQueueMessageSchema.parse(body);
  const topics = await getAccountTopics(userId);
  await withFinalizerAsync(
    async () => {
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
    },
    async () => {
      // Best-effort, as the topics of a write are: a failed publish costs a reader one refresh, never the sweep
      await settleAll(
        Array.from(
          new Set(topics),
          (topic) => () =>
            publishTopicsBestEffort([topic], `Failed to publish the topic "${topic}" of an account's deletion:`),
        ),
        MAX_CONCURRENT_ACCOUNT_TOPIC_PUBLISHES,
      );
    },
  );
};
