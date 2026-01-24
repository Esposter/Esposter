import { selectSearchHistoryInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateSearchHistoryInputSchema = selectSearchHistoryInMessageSchema.pick({
  id: true,
  query: true,
});
export type UpdateSearchHistoryInput = z.infer<typeof updateSearchHistoryInputSchema>;
