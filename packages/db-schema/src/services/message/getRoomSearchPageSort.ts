import { ROOM_SEARCH_NEWEST_PAGE_SORT, ROOM_SEARCH_RANK_PAGE_SORT } from "#src/services/message/constants";
import { getSearchExpression } from "@esposter/shared";

// The order a search reads in: by rank when the query has text, and by the message's time when it does not
export const getRoomSearchPageSort = (query: string) =>
  getSearchExpression(query) ? ROOM_SEARCH_RANK_PAGE_SORT : ROOM_SEARCH_NEWEST_PAGE_SORT;
