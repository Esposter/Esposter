import type { TableMapper } from "#src/models/cutover/TableMapper";

import { getReverseTickedMilliseconds } from "#src/services/cutover/tables/getReverseTickedMilliseconds";
import { messageEmojisInMessage, messagesInMessage, StreamTable } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { z } from "zod";

// An emoji row of the legacy MessagesMetadata table: one emoji on one message, and the members who chose it
const legacyEmojiSchema = z.object({
  emojiTag: z.string(),
  messageRowKey: z.string(),
  partitionKey: z.string(),
  rowKey: z.string(),
  userIds: z.array(z.string()).optional(),
});

// The MessagesMetadata table: one row per emoji on a message. It attaches to its message, so every message is copied first
export const messageEmojiTableMapper: TableMapper = {
  azureTable: StreamTable.MessagesMetadata,
  countByPartitionSql: `SELECT m."roomId" AS "partitionKey", COUNT(*) AS "count" FROM "${getTableName(messageEmojisInMessage)}" e JOIN "${getTableName(messagesInMessage)}" m ON m."id" = e."messageId" GROUP BY m."roomId"`,
  coreTable: getTableName(messageEmojisInMessage),
  map: (entity, { idMap, timestamp }) => {
    const emoji = legacyEmojiSchema.parse(entity);
    // An emoji on a message that is gone has nothing to attach to
    const messageId = idMap.get(StreamTable.Messages, emoji.partitionKey, emoji.messageRowKey);
    if (messageId === undefined) return undefined;
    const createdAt = getReverseTickedMilliseconds(emoji.rowKey);
    return {
      createdAt,
      deletedAt: null,
      emojiTag: emoji.emojiTag,
      messageId,
      updatedAt: timestamp?.getTime() ?? createdAt,
      userIds: JSON.stringify(emoji.userIds ?? []),
    };
  },
};
