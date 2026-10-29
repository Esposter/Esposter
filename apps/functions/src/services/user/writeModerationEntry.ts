import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getTableClient } from "#src/services/azure/getTableClient";
import { readModerationRecordsByTarget } from "#src/services/user/readModerationRecordsByTarget";
import { AzureTable } from "@esposter/db-schema";

// The moderation records that name the person as their target, from both moderation tables.
// A person has the right to see what was recorded about them, so the records they acted on as a moderator are not read
export const writeModerationEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const logs = await readModerationRecordsByTarget(await getTableClient(AzureTable.ModerationLog), userId);
  const notes = await readModerationRecordsByTarget(await getTableClient(AzureTable.ModerationNotes), userId);
  await archive.addJsonEntry("moderation.json", { logs, notes });
};
