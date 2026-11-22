import type { SearchHistoryInMessage } from "@esposter/db-schema";

// A search is held by its id, which the server mints, so the cursor's page names each search by its id
export type SearchHistoryKey = Pick<SearchHistoryInMessage, "id">;
