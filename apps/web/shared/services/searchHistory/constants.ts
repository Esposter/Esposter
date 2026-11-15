import type { PageSort } from "@esposter/db-schema";

import { SortOrder } from "@esposter/db-schema";

// Newest first on the id, which is creation order, so a page is a range scan of the reader's searches in the room over
// The searchHistories_userId_roomId_id_index
export const SEARCH_HISTORY_PAGE_SORT = { keys: ["id"], order: SortOrder.Desc } as const satisfies PageSort<"id">;
