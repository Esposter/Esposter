import { resourceFilterInputSchema } from "#shared/models/db/resource/ResourceFilterInput";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { resourceListSortKeySchema } from "#shared/models/resource/ResourceListSortKey";
import { z } from "zod";

export const readResourceListInputSchema = z.object({
  ...createOffsetPaginationParamsSchema(resourceListSortKeySchema).shape,
  ...resourceFilterInputSchema.shape,
});
export type ReadResourceListInput = z.infer<typeof readResourceListInputSchema>;
