import type { Database, MessageEntity } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getMentionNotificationConditions } from "@/services/message/mention/getMentionNotificationConditions";
import { PUSH_SUBSCRIPTION_COLUMNS } from "@/services/pushNotification/constants";
import {
  NotificationType,
  pushSubscriptionsInMessage,
  userStatusesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { classifyMentions } from "@esposter/shared";
import { and, eq, ne, or } from "drizzle-orm";

export const getPushSubscriptionsForMessage = async (
  db: Database,
  { message, partitionKey, userId }: Pick<MessageEntity, "message" | "partitionKey" | "userId">,
) => {
  const andWheres: (SQL | undefined)[] = [eq(usersToRoomsInMessage.roomId, partitionKey)];
  if (userId) andWheres.push(ne(usersToRoomsInMessage.userId, userId));

  const classifiedMentions = classifyMentions(message);
  const mentionConditions = await getMentionNotificationConditions(db, partitionKey, classifiedMentions);
  const mentionOrWheres = [eq(usersToRoomsInMessage.notificationType, NotificationType.All), ...mentionConditions];
  andWheres.push(or(...mentionOrWheres));
  return db
    .select({ ...PUSH_SUBSCRIPTION_COLUMNS, userId: pushSubscriptionsInMessage.userId })
    .from(pushSubscriptionsInMessage)
    .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, pushSubscriptionsInMessage.userId))
    .leftJoin(userStatusesInMessage, eq(userStatusesInMessage.userId, pushSubscriptionsInMessage.userId))
    .where(and(...andWheres));
};
