import { selectSearchHistoryInMessageSchema } from "@esposter/db-schema";
import type { z } from "zod";

export const deleteSearchHistoryInputSchema = selectSearchHistoryInMessageSchema.shape.id;
export type DeleteSearchHistoryInput = z.infer<typeof deleteSearchHistoryInputSchema>;
