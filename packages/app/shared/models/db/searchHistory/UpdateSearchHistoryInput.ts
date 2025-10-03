import { selectSearchHistorySchema } from "#shared/db/schema/searchHistories";
import { z } from "zod";

export const updateSearchHistoryInputSchema = selectSearchHistorySchema.pick({
  id: true,
  query: true,
});
export type UpdateSearchHistoryInput = z.infer<typeof updateSearchHistoryInputSchema>;
