import type { z } from "zod";

import { resourceFilterInputSchema } from "#shared/models/db/resource/ResourceFilterInput";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { selectResourceInResourceSchema } from "@esposter/db-schema";

export const readResourcesInputSchema = createOffsetPaginationParamsSchema(selectResourceInResourceSchema.keyof())
  // The publication filter the resource list takes, so a picker of published resources is this read with it set
  .extend({ isPublished: resourceFilterInputSchema.shape.isPublished })
  .prefault({});
export type ReadResourcesInput = z.infer<typeof readResourcesInputSchema>;
