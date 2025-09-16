import { selectSearchHistorySchema } from "#shared/db/schema/searchHistories";
import { z } from "zod";

export const createSearchHistoryInputSchema = selectSearchHistorySchema
  .pick({
    filters: true,
    query: true,
    roomId: true,
  })
  .partial({ filters: true });
export type CreateSearchHistoryInput = z.infer<typeof createSearchHistoryInputSchema>;
