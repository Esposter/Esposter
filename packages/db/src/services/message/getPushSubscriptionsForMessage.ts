import type { MessageEntity, schema } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { NotificationType, pushSubscriptions, usersToRooms } from "@esposter/db-schema";
import { getMentions, MENTION_ID_ATTRIBUTE } from "@esposter/shared";
import { and, eq, inArray, ne, or } from "drizzle-orm";

export const getPushSubscriptionsForMessage = (
  db: PostgresJsDatabase<typeof schema>,
  { message, partitionKey, userId }: Pick<MessageEntity, "message" | "partitionKey" | "userId">,
) => {
  const andWheres: (SQL | undefined)[] = [eq(usersToRooms.roomId, partitionKey)];
  if (userId) andWheres.push(ne(usersToRooms.userId, userId));

  const mentionOrWheres: (SQL | undefined)[] = [eq(usersToRooms.notificationType, NotificationType.All)];
  const mentions = getMentions(message);
  const mentionedUserIds = mentions.map((m) => m.getAttribute(MENTION_ID_ATTRIBUTE)).filter((id) => id !== undefined);
  if (mentionedUserIds.length > 0)
    mentionOrWheres.push(
      and(
        eq(usersToRooms.notificationType, NotificationType.DirectMessage),
        inArray(usersToRooms.userId, mentionedUserIds),
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
    .where(and(...andWheres));
};
