import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { standardMessageEntitySchema } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";
import { z } from "zod";

export const readMySentMessagesInputSchema = createOffsetPaginationParamsSchema(standardMessageEntitySchema.keyof(), [
  { key: ItemMetadataPropertyNames.createdAt, order: SortOrder.Desc },
])
  .omit({ sortBy: true })
  .prefault({});
export type ReadMySentMessagesInput = z.infer<typeof readMySentMessagesInputSchema>;
