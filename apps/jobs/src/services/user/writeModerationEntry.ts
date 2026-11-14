import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { readModerationRecordsByTarget } from "#src/services/user/readModerationRecordsByTarget";

// The moderation records that name the person as their target, from both moderation tables.
// A person has the right to see what was recorded about them, so the records they acted on as a moderator are not read
export const writeModerationEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  await archive.addJsonEntry("moderation.json", await readModerationRecordsByTarget(db, userId));
};
