import { selectSearchHistorySchema } from "#shared/db/schema/searchHistories";
import { z } from "zod";

export const deleteSearchHistoryInputSchema = selectSearchHistorySchema.shape.id;
export type DeleteSearchHistoryInput = z.infer<typeof deleteSearchHistoryInputSchema>;
