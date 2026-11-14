import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getStreamTableClient } from "#src/services/streams/getStreamTableClient";
import { readModerationRecordsByTarget } from "#src/services/user/readModerationRecordsByTarget";
import { StreamTable } from "@esposter/db-schema";

// The moderation records that name the person as their target, from both moderation tables.
// A person has the right to see what was recorded about them, so the records they acted on as a moderator are not read
export const writeModerationEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const logs = await readModerationRecordsByTarget(getStreamTableClient(StreamTable.ModerationLog), userId);
  const notes = await readModerationRecordsByTarget(getStreamTableClient(StreamTable.ModerationNotes), userId);
  await archive.addJsonEntry("moderation.json", { logs, notes });
};
