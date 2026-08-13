import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { standardMessageEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const readMySentMessagesInputSchema = createOffsetPaginationParamsSchema(standardMessageEntitySchema.keyof(), [
  CREATED_AT_DESCENDING_SORT_ITEM,
])
  .omit({ sortBy: true })
  .prefault({});
export type ReadMySentMessagesInput = z.infer<typeof readMySentMessagesInputSchema>;
