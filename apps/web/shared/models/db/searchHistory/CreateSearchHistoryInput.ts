import type { z } from "zod";

import { selectSearchHistoryInMessageSchema } from "@esposter/db-schema";

export const createSearchHistoryInputSchema = selectSearchHistoryInMessageSchema
  .pick({ filters: true, query: true, roomId: true })
  .partial({ filters: true });
export type CreateSearchHistoryInput = z.infer<typeof createSearchHistoryInputSchema>;
