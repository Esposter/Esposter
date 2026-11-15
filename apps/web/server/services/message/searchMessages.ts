import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { SearchMessagesResult } from "#shared/models/db/message/SearchMessagesResult";
import type { Filter } from "@esposter/db-schema";

import { fanOutRoomReads } from "#server/services/message/fanOutRoomReads";
import { getSearchableFilters } from "#shared/services/message/getSearchableFilters";
import { toMergedPage } from "@esposter/db";
import { FilterType, getRoomSearchPageSort } from "@esposter/db-schema";

// The rooms a search asks: the rooms its `in:` filters name, or else the room it was made in. The `in:` list is the
// Caller's own and is bounded at the router, so the fan-out is bounded by what they asked for. A room's object answers
// The filters that are not `in:`
const getSearchRoomIds = (filters: Filter[], roomId: string): string[] => {
  const inRoomIds = filters.flatMap(({ type, value }) =>
    type === FilterType.In && typeof value === "string" ? [value] : [],
  );
  return inRoomIds.length > 0 ? inRoomIds : [roomId];
};

// Each room is asked for its matches after the cursor, and they merge into one page in the order the query gives them.
// The count of every match is answered with the first page only, since it is the same for every page of the search
export const searchMessages = async ({
  cursor,
  filters,
  limit,
  query,
  roomId,
}: SearchMessagesInput): Promise<SearchMessagesResult> => {
  const sort = getRoomSearchPageSort(query);
  const searchableFilters = getSearchableFilters(filters);
  const roomFilters = searchableFilters.filter(({ type }) => type !== FilterType.In);
  const isCounted = cursor.values.length === 0;
  const results = await fanOutRoomReads(getSearchRoomIds(searchableFilters, roomId), (roomObject) =>
    roomObject.searchMessages({ cursor, filters: roomFilters, isCounted, limit: limit + 1, query }),
  );
  const page = toMergedPage(
    Array.from(results, ([resultRoomId, { messages }]) =>
      messages.map((message) => ({ ...message, roomId: resultRoomId })),
    ),
    sort,
    cursor,
    limit,
  );
  const items = page.items.map(({ rank: _rank, ...message }) => message);
  if (!isCounted) return { items, nextCursor: page.nextCursor };

  const count = [...results.values()].reduce((total, { count: roomCount }) => total + roomCount, 0);
  return { count, items, nextCursor: page.nextCursor };
};
