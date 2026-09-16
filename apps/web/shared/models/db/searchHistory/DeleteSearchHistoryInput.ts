import type { z } from "zod";

import { selectSearchHistoryInMessageSchema } from "@esposter/db-schema";

export const deleteSearchHistoryInputSchema = selectSearchHistoryInMessageSchema.shape.id;
export type DeleteSearchHistoryInput = z.infer<typeof deleteSearchHistoryInputSchema>;
