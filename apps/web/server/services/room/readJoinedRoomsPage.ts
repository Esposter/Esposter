import type { Context } from "#server/trpc/context";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { RoomInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getCursorPaginationData } from "#server/services/pagination/cursor/getCursorPaginationData";
import { parseSortByToSql } from "#server/services/pagination/sorting/parseSortByToSql";
import { roomsInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, getColumns } from "drizzle-orm";

// One page of the rooms the wheres select, each joined to the membership the join condition names. It reads one row
// Past the limit, which is how the page knows there is more
export const readJoinedRoomsPage = async (
  db: Context["db"],
  innerJoinCondition: SQL | undefined,
  wheres: (SQL | undefined)[],
  limit: number,
  sortBy: SortItem<keyof RoomInMessage & string>[],
): Promise<CursorPaginationData<RoomInMessage>> => {
  const rooms = await db
    .select(getColumns(roomsInMessage))
    .from(roomsInMessage)
    .innerJoin(usersToRoomsInMessage, innerJoinCondition)
    .where(and(...wheres))
    .orderBy(...parseSortByToSql(roomsInMessage, sortBy))
    .limit(limit + 1);
  return getCursorPaginationData(rooms, limit, sortBy);
};
