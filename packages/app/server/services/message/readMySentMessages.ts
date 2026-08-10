import type { ReadMySentMessagesInput } from "#shared/models/db/message/ReadMySentMessagesInput";
import type { ReadMySentMessagesResult } from "#shared/models/db/message/ReadMySentMessagesResult";
import type { SelectFields } from "@azure/search-documents";
import type { Clause, MessageEntity, relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { readMessageSearchDocuments } from "@@/server/services/message/readMessageSearchDocuments";
import { getSearchNullClause, serializeSearchClauses } from "@esposter/db";
import { BinaryOperator, roomsInMessage, StandardMessageEntityPropertyNames } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";
import { inArray } from "drizzle-orm";

export const readMySentMessages = async (
  { limit, offset }: ReadMySentMessagesInput,
  db: PostgresJsDatabase<typeof relations>,
  userId: string,
): Promise<ReadMySentMessagesResult> => {
  const clauses: Clause<Record<SelectFields<MessageEntity> & string, unknown>>[] = [
    { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.eq, value: userId },
    getSearchNullClause(ItemMetadataPropertyNames.deletedAt),
  ];
  const { count, messages } = await readMessageSearchDocuments({
    filter: serializeSearchClauses(clauses),
    limit,
    offset,
    orderBy: [`${ItemMetadataPropertyNames.createdAt} ${SortOrder.Desc}`],
  });
  const roomIds = [...new Set(messages.map(({ partitionKey }) => partitionKey))];
  const rooms =
    roomIds.length > 0 ? await db.select().from(roomsInMessage).where(inArray(roomsInMessage.id, roomIds)) : [];
  const roomMap = new Map(rooms.map((room) => [room.id, room]));
  return {
    count: count ?? 0,
    data: {
      hasMore: messages.length > limit,
      items: messages.slice(0, limit).flatMap((message) => {
        const room = roomMap.get(message.partitionKey);
        return room ? [{ message, room }] : [];
      }),
    },
  };
};
