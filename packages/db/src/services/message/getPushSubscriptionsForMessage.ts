import type { MessageEntity, schema } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { NotificationType, pushSubscriptions, UserStatus, userStatuses, usersToRooms } from "@esposter/db-schema";
import { getMentions, MENTION_EVERYONE_ID, MENTION_HERE_ID, MENTION_ID_ATTRIBUTE } from "@esposter/shared";
import { and, eq, inArray, isNull, ne, or } from "drizzle-orm";

export const getPushSubscriptionsForMessage = (
  db: PostgresJsDatabase<typeof schema>,
  { message, partitionKey, userId }: Pick<MessageEntity, "message" | "partitionKey" | "userId">,
) => {
  const andWheres: (SQL | undefined)[] = [eq(usersToRooms.roomId, partitionKey)];
  if (userId) andWheres.push(ne(usersToRooms.userId, userId));

  const mentionOrWheres: (SQL | undefined)[] = [eq(usersToRooms.notificationType, NotificationType.All)];
  const mentions = getMentions(message);
  const mentionedIds = mentions.map((m) => m.getAttribute(MENTION_ID_ATTRIBUTE)).filter((id) => id !== undefined);

  const hasEveryoneMention = mentionedIds.includes(MENTION_EVERYONE_ID);
  const hasHereMention = mentionedIds.includes(MENTION_HERE_ID);
  const regularMentionedUserIds = mentionedIds.filter((id) => id !== MENTION_EVERYONE_ID && id !== MENTION_HERE_ID);

  if (regularMentionedUserIds.length > 0)
    mentionOrWheres.push(
      and(
        eq(usersToRooms.notificationType, NotificationType.DirectMessage),
        inArray(usersToRooms.userId, regularMentionedUserIds),
      ),
    );

  if (hasEveryoneMention) mentionOrWheres.push(ne(usersToRooms.notificationType, NotificationType.Never));

  if (hasHereMention)
    mentionOrWheres.push(
      and(
        ne(usersToRooms.notificationType, NotificationType.Never),
        or(eq(userStatuses.status, UserStatus.Online), isNull(userStatuses.status)),
      ),
    );

  andWheres.push(or(...mentionOrWheres));

  return db
    .select({
      auth: pushSubscriptions.auth,
      endpoint: pushSubscriptions.endpoint,
      expirationTime: pushSubscriptions.expirationTime,
      id: pushSubscriptions.id,
      p256dh: pushSubscriptions.p256dh,
    })
    .from(pushSubscriptions)
    .innerJoin(usersToRooms, eq(usersToRooms.userId, pushSubscriptions.userId))
    .leftJoin(userStatuses, eq(userStatuses.userId, pushSubscriptions.userId))
    .where(and(...andWheres));
};
