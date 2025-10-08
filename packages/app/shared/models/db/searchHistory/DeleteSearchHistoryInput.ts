import { selectSearchHistorySchema } from "@esposter/db";
import { z } from "zod";

export const deleteSearchHistoryInputSchema = selectSearchHistorySchema.shape.id;
export type DeleteSearchHistoryInput = z.infer<typeof deleteSearchHistoryInputSchema>;
