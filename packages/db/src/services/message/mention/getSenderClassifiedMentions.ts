import type { ClassifiedMentions } from "#src/models/message/ClassifiedMentions";
import type { Database } from "@esposter/db-schema";

import { classifyMentions } from "#src/services/message/mention/classifyMentions";
import { checkHasPermission } from "#src/services/room/rbac/checkHasPermission";
import { RoomPermission } from "@esposter/db-schema";

// `@everyone` and `@here` notify the whole room, so they are the sender's to make only with `MentionEveryone`. A
// Sender without it has the span read as plain text and notifies no one by it. A message with no sender (a webhook's)
// Holds no permissions to read, so its broadcasts stand as they always have.
export const getSenderClassifiedMentions = async (
  db: Database,
  roomId: string,
  userId: string | undefined,
  message: string,
): Promise<ClassifiedMentions> => {
  const classifiedMentions = classifyMentions(message);
  if (classifiedMentions.broadcastIds.length === 0 || !userId) return classifiedMentions;

  const hasMentionEveryone = await checkHasPermission(db, userId, roomId, RoomPermission.MentionEveryone);
  return hasMentionEveryone ? classifiedMentions : { ...classifiedMentions, broadcastIds: [] };
};
