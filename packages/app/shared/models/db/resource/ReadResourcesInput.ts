import type { z } from "zod";

import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { selectResourceSchema } from "@esposter/db-schema";

export const readResourcesInputSchema = createOffsetPaginationParamsSchema(selectResourceSchema.keyof()).prefault({});
export type ReadResourcesInput = z.infer<typeof readResourcesInputSchema>;
