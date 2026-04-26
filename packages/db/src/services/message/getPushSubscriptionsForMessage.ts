import type { MessageEntity, schema } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import {
  NotificationType,
  pushSubscriptionsInMessage,
  UserStatus,
  userStatusesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { getMentions, MENTION_EVERYONE_ID, MENTION_HERE_ID, MENTION_ID_ATTRIBUTE } from "@esposter/shared";
import { and, eq, inArray, isNull, ne, or } from "drizzle-orm";

export const getPushSubscriptionsForMessage = (
  db: PostgresJsDatabase<typeof schema>,
  { message, partitionKey, userId }: Pick<MessageEntity, "message" | "partitionKey" | "userId">,
) => {
  const andWheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.roomId, partitionKey)];
  if (userId) andWheres.push(ne(usersToRoomsInMessage.userId, userId));

  const mentionOrWheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.notificationType, NotificationType.All)];
  const mentions = getMentions(message);
  const mentionedIds = mentions.map((m) => m.getAttribute(MENTION_ID_ATTRIBUTE)).filter((id) => id !== undefined);

  const hasEveryoneMention = mentionedIds.includes(MENTION_EVERYONE_ID);
  const hasHereMention = mentionedIds.includes(MENTION_HERE_ID);
  const regularMentionedUserIds = mentionedIds.filter((id) => id !== MENTION_EVERYONE_ID && id !== MENTION_HERE_ID);

  if (regularMentionedUserIds.length > 0)
    mentionOrWheres.push(
      and(
        eq(usersToRoomsInMessage.notificationType, NotificationType.DirectMessage),
        inArray(usersToRoomsInMessage.userId, regularMentionedUserIds),
      ),
    );

  if (hasEveryoneMention) mentionOrWheres.push(ne(usersToRoomsInMessage.notificationType, NotificationType.Never));

  if (hasHereMention)
    mentionOrWheres.push(
      and(
        ne(usersToRoomsInMessage.notificationType, NotificationType.Never),
        or(eq(userStatusesInMessage.status, UserStatus.Online), isNull(userStatusesInMessage.status)),
      ),
    );

  andWheres.push(or(...mentionOrWheres));

  return db
    .select({
      auth: pushSubscriptionsInMessage.auth,
      endpoint: pushSubscriptionsInMessage.endpoint,
      expirationTime: pushSubscriptionsInMessage.expirationTime,
      id: pushSubscriptionsInMessage.id,
      p256dh: pushSubscriptionsInMessage.p256dh,
    })
    .from(pushSubscriptionsInMessage)
    .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, pushSubscriptionsInMessage.userId))
    .leftJoin(userStatusesInMessage, eq(userStatusesInMessage.userId, pushSubscriptionsInMessage.userId))
    .where(and(...andWheres));
};
