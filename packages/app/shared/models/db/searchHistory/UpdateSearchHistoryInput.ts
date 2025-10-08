import { selectSearchHistorySchema } from "@esposter/db";
import { z } from "zod";

export const updateSearchHistoryInputSchema = selectSearchHistorySchema.pick({
  id: true,
  query: true,
});
export type UpdateSearchHistoryInput = z.infer<typeof updateSearchHistoryInputSchema>;
