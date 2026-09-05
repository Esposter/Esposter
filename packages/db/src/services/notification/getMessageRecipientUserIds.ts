import type { Database, MessageEntity } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getMentionNotificationConditions } from "#src/services/message/mention/getMentionNotificationConditions";
import { getThreadFollowerUserIds } from "#src/services/notification/getThreadFollowerUserIds";
import { NotificationType, userStatusesInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { classifyMentions } from "@esposter/shared";
import { and, eq, ne, or } from "drizzle-orm";

// Everyone one message notifies, thread reply included. A reply widens this set with the thread's followers
// Rather than raising a second notification at them, so the two rules are applied to one recipient set and the
// Union deduplicates — where two notifications would have to agree by hand on who the other already reached.
export const getMessageRecipientUserIds = async (
  db: Database,
  {
    message,
    partitionKey,
    threadRootRowKey,
    userId,
  }: Pick<MessageEntity, "message" | "partitionKey" | "userId"> & { threadRootRowKey?: string },
): Promise<string[]> => {
  const andWheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.roomId, partitionKey)];
  if (userId) andWheres.push(ne(usersToRoomsInMessage.userId, userId));

  const classifiedMentions = classifyMentions(message);
  const mentionConditions = await getMentionNotificationConditions(db, partitionKey, classifiedMentions);
  andWheres.push(or(eq(usersToRoomsInMessage.notificationType, NotificationType.All), ...mentionConditions));
  const roomRecipients = await db
    .selectDistinct({ userId: usersToRoomsInMessage.userId })
    .from(usersToRoomsInMessage)
    // Always left-joined, @here mention or not, so the query shape stays one shape
    .leftJoin(userStatusesInMessage, eq(userStatusesInMessage.userId, usersToRoomsInMessage.userId))
    .where(and(...andWheres));
  const recipientUserIds = new Set(roomRecipients.map((roomRecipient) => roomRecipient.userId));
  if (threadRootRowKey)
    for (const followerUserId of await getThreadFollowerUserIds(db, {
      roomId: partitionKey,
      senderUserId: userId,
      threadRootRowKey,
    }))
      recipientUserIds.add(followerUserId);
  return [...recipientUserIds];
};
