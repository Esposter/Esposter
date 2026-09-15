import type { z } from "zod";

import { selectSearchHistoryInMessageSchema } from "@esposter/db-schema";

export const updateSearchHistoryInputSchema = selectSearchHistoryInMessageSchema.pick({
  id: true,
  query: true,
});
export type UpdateSearchHistoryInput = z.infer<typeof updateSearchHistoryInputSchema>;
