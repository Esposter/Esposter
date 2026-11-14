import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { readRoomModerationActionsByUser } from "#src/services/user/readRoomModerationActionsByUser";

// The moderation actions the person took as moderator or admin in rooms they own.
// A record where the person is the target is in moderation.json.
// A moderator's own note about a target is not an action, so it is not written
export const writeModerationActionEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  await archive.addJsonEntry("moderation-actions.json", await readRoomModerationActionsByUser(db, userId));
};
