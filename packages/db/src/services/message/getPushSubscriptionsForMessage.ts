import type { MessageEntity, schema } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { NotificationType, pushSubscriptionsInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { getMentions, MENTION_ID_ATTRIBUTE } from "@esposter/shared";
import { and, eq, inArray, ne, or } from "drizzle-orm";

export const getPushSubscriptionsForMessage = (
  db: PostgresJsDatabase<typeof schema>,
  { message, partitionKey, userId }: Pick<MessageEntity, "message" | "partitionKey" | "userId">,
) => {
  const andWheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.roomId, partitionKey)];
  if (userId) andWheres.push(ne(usersToRoomsInMessage.userId, userId));

  const mentionOrWheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.notificationType, NotificationType.All)];
  const mentions = getMentions(message);
  const mentionedUserIds = mentions.map((m) => m.getAttribute(MENTION_ID_ATTRIBUTE)).filter((id) => id !== undefined);
  if (mentionedUserIds.length > 0)
    mentionOrWheres.push(
      and(
        eq(usersToRoomsInMessage.notificationType, NotificationType.DirectMessage),
        inArray(usersToRoomsInMessage.userId, mentionedUserIds),
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
    .where(and(...andWheres));
};
