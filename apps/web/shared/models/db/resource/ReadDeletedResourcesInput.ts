import type { z } from "zod";

import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { resourceListSortKeySchema } from "#shared/models/resource/ResourceListSortKey";

export const readDeletedResourcesInputSchema = createOffsetPaginationParamsSchema(resourceListSortKeySchema).prefault(
  {},
);
export type ReadDeletedResourcesInput = z.infer<typeof readDeletedResourcesInputSchema>;
