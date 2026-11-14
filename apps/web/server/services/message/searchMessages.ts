import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";
import type { SearchMessagesResult } from "#shared/models/db/message/SearchMessagesResult";
import type { Filter, RoomMessage } from "@esposter/db-schema";

import { fanOutRoomReads } from "#server/services/message/fanOutRoomReads";
import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { getSearchableFilters } from "#shared/services/message/getSearchableFilters";
import { FilterType } from "@esposter/db-schema";
import { getSearchExpression } from "@esposter/shared";

// The rooms a search asks: the rooms its `in:` filters name, or else the room it was made in. The `in:` list is the
// caller's own, so the fan-out is bounded by what they asked for. A room's object answers the filters that are not `in:`
const getSearchRoomIds = (filters: Filter[], roomId: string): string[] => {
  const inRoomIds = filters.flatMap(({ type, value }) =>
    type === FilterType.In && typeof value === "string" ? [value] : [],
  );
  return inRoomIds.length > 0 ? inRoomIds : [roomId];
};

// Turn about by rank position: every room's first match, then every room's second, in the order the rooms were named.
// Each room ranks its own matches by bm25, and a score is not comparable across rooms, since each room's index counts its
// own terms. With no text, each room lists its matches newest first, and those lists merge by the message's own time and
// id, which is exact across rooms
const interleaveByRank = <THit extends RoomMessage>(lists: THit[][]): THit[] => {
  const depth = Math.max(0, ...lists.map(({ length }) => length));
  return Array.from({ length: depth }, (_, rank) => lists.flatMap((list) => list.slice(rank, rank + 1))).flat();
};

const mergeNewestFirst = <THit extends RoomMessage>(lists: THit[][]): THit[] =>
  lists
    .flat()
    .toSorted(
      (firstMessage, secondMessage) =>
        secondMessage.createdAt.getTime() - firstMessage.createdAt.getTime() || secondMessage.id - firstMessage.id,
    );

// Each room is asked for the first offset + limit + 1 of its own list, the most the merged page can reach from it. The
// count is every room's own count added together
export const searchMessages = async ({
  filters,
  limit,
  offset,
  query,
  roomId,
}: SearchMessagesInput): Promise<SearchMessagesResult> => {
  const searchableFilters = getSearchableFilters(filters);
  const roomFilters = searchableFilters.filter(({ type }) => type !== FilterType.In);
  const results = await fanOutRoomReads(getSearchRoomIds(searchableFilters, roomId), (roomObject) =>
    roomObject.searchMessages({ filters: roomFilters, limit: offset + limit + 1, offset: 0, query }),
  );
  const lists = [...results].map(([roomId, { messages }]) => messages.map((message) => ({ ...message, roomId })));
  const count = [...results.values()].reduce((total, { count: roomCount }) => total + roomCount, 0);
  const merged = getSearchExpression(query) ? interleaveByRank(lists) : mergeNewestFirst(lists);
  return { count, data: getBasePaginationData(merged.slice(offset), limit) };
};
