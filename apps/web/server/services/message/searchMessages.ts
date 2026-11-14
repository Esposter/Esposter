import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { SearchMessagesResult } from "#shared/models/db/message/SearchMessagesResult";
import type { Database } from "@esposter/db-schema";

import { getMessageSearchExpression } from "#server/services/message/search/getMessageSearchExpression";
import { getSearchFilterConditions } from "#server/services/message/search/getSearchFilterConditions";
import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { getSearchableFilters } from "#shared/services/message/getSearchableFilters";
import { FilterType, messagesInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, count, desc, eq, isNull, sql } from "drizzle-orm";

// The text is matched by the FTS5 index the triggers keep beside `messages`, and the rows it finds are then narrowed by
// the room, the soft delete and the filters, which all read the row itself. Ranked by bm25 with the message weighted 3 and
// the sender 1.5 when there is text to rank by; a filter-only search reads newest first
export const searchMessages = async (
  db: Database,
  { filters, limit, offset, query, roomId }: SearchMessagesInput,
): Promise<SearchMessagesResult> => {
  const searchableFilters = getSearchableFilters(filters);
  const hasRoomInFilter = searchableFilters.some(({ type }) => type === FilterType.In);
  const expression = getMessageSearchExpression(query);
  const conditions = [
    ...(hasRoomInFilter ? [] : [eq(messagesInMessage.roomId, roomId)]),
    isNull(messagesInMessage.deletedAt),
    ...getSearchFilterConditions(searchableFilters),
    ...(expression ? [sql`rowid in (select rowid from messages_search where messages_search match ${expression})`] : []),
  ];
  const where = and(...conditions);
  const rank = sql`(select bm25(messages_search, 3, 1, 1.5) from messages_search where messages_search match ${expression} and rowid = ${messagesInMessage}.rowid)`;
  const newestFirst = [desc(messagesInMessage.createdAt), desc(messagesInMessage.id)];
  const [messages, totals] = await Promise.all([
    db
      .select()
      .from(messagesInMessage)
      .where(where)
      .orderBy(...(expression ? [rank, ...newestFirst] : newestFirst))
      .limit(limit + 1)
      .offset(offset),
    db.select({ count: count() }).from(messagesInMessage).where(where),
  ]);
  return { count: takeOne(totals, 0).count, data: getBasePaginationData(messages, limit) };
};
