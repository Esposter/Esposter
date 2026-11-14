import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { SearchMessagesResult } from "#shared/models/db/message/SearchMessagesResult";
import type { Database, MessageInMessage } from "@esposter/db-schema";

import { getSearchFilterConditions } from "#server/services/message/search/getSearchFilterConditions";
import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { getSearchableFilters } from "#shared/services/message/getSearchableFilters";
import { FilterType, messagesInMessage } from "@esposter/db-schema";
import { getSearchExpression, takeOne } from "@esposter/shared";
import { and, count, desc, eq, isNull, sql } from "drizzle-orm";

// With text, the rows are the index's matches narrowed by the room, the soft delete and the filters, ranked by bm25 with
// the message weighted 3 and the sender 1.5. The ids of one page are read first, in that order, and the rows are then
// read by a single bound JSON list, so a page never binds more parameters than D1 allows. A filter-only search reads
// newest first, with no index involved
export const searchMessages = async (
  db: Database,
  { filters, limit, offset, query, roomId }: SearchMessagesInput,
): Promise<SearchMessagesResult> => {
  const searchableFilters = getSearchableFilters(filters);
  const hasRoomInFilter = searchableFilters.some(({ type }) => type === FilterType.In);
  const expression = getSearchExpression(query);
  const where = and(
    ...(hasRoomInFilter ? [] : [eq(messagesInMessage.roomId, roomId)]),
    isNull(messagesInMessage.deletedAt),
    ...getSearchFilterConditions(searchableFilters),
  );
  if (!expression) {
    const [messages, totals] = await Promise.all([
      db
        .select()
        .from(messagesInMessage)
        .where(where)
        .orderBy(desc(messagesInMessage.createdAt), desc(messagesInMessage.id))
        .limit(limit + 1)
        .offset(offset),
      db.select({ count: count() }).from(messagesInMessage).where(where),
    ]);
    return { count: takeOne(totals, 0).count, data: getBasePaginationData(messages, limit) };
  }

  const [ranked, totals] = await Promise.all([
    db.all<{ id: string }>(sql`
      select ${messagesInMessage.id} as id
      from ${messagesInMessage}
      join messages_search on messages_search.messageId = ${messagesInMessage.id}
      where messages_search match ${expression} and ${where}
      order by bm25(messages_search, 3, 1, 1.5), ${messagesInMessage.createdAt} desc, ${messagesInMessage.id} desc
      limit ${limit + 1} offset ${offset}`),
    db.all<{ count: number }>(sql`
      select count(*) as count
      from ${messagesInMessage}
      join messages_search on messages_search.messageId = ${messagesInMessage.id}
      where messages_search match ${expression} and ${where}`),
  ]);
  const ids = ranked.map(({ id }) => id);
  const rows = ids.length > 0 ? await readMessagesByIds(db, ids) : [];
  return { count: takeOne(totals, 0).count, data: getBasePaginationData(rows, limit) };
};

// The rows of the given ids in the order given. The ids ride as one JSON parameter, since D1 caps a statement's parameters
const readMessagesByIds = async (db: Database, ids: string[]): Promise<MessageInMessage[]> => {
  const rows = await db
    .select()
    .from(messagesInMessage)
    .where(sql`${messagesInMessage.id} in (select value from json_each(${JSON.stringify(ids)}))`);
  const rowMap = new Map(rows.map((row) => [row.id, row]));
  return ids.flatMap((id) => {
    const row = rowMap.get(id);
    return row ? [row] : [];
  });
};
