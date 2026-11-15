import type { z } from "zod";

import { SEARCH_HISTORY_PAGE_SORT } from "#shared/services/searchHistory/constants";
import { createPageInputSchema, selectSearchHistoryInMessageSchema } from "@esposter/db-schema";

export const readSearchHistoriesInputSchema = createPageInputSchema(SEARCH_HISTORY_PAGE_SORT).extend({
  roomId: selectSearchHistoryInMessageSchema.shape.roomId,
});
export type ReadSearchHistoriesInput = z.infer<typeof readSearchHistoriesInputSchema>;
