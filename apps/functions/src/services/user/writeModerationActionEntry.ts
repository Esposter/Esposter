import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { getTableClient } from "#src/services/azure/getTableClient";
import { db } from "#src/services/shared/db";
import { readRoomModerationActionsByUser } from "#src/services/user/readRoomModerationActionsByUser";
import { AzureTable } from "@esposter/db-schema";

// The moderation actions the person took as moderator or admin in rooms they own. A record where the person is the target
// Is in moderation.json, and a moderator's own note about a target is not an action, so it is not written
export const writeModerationActionEntry = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const rooms = await db.query.roomsInMessage.findMany({ columns: { id: true }, where: { userId: { eq: userId } } });
  const moderationLogClient = await getTableClient(AzureTable.ModerationLog);
  const actions = [];
  for (const room of rooms)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one room at a time, as the room entries are read
    actions.push(...(await readRoomModerationActionsByUser(moderationLogClient, room.id, userId)));
  await archive.addJsonEntry("moderation-actions.json", actions);
};
