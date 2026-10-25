import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { RoomInMessage } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";

export const ROOM_SEARCH_SORT_BY = [
  { key: "displayName", order: SortOrder.Asc },
  { key: "id", order: SortOrder.Asc },
] satisfies SortItem<"displayName" | keyof RoomInMessage>[];
