import type { z } from "zod";

import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { selectResourceInResourceSchema } from "@esposter/db-schema";

export const readResourcesInputSchema = createOffsetPaginationParamsSchema(
  selectResourceInResourceSchema.keyof(),
).prefault({});
export type ReadResourcesInput = z.infer<typeof readResourcesInputSchema>;
