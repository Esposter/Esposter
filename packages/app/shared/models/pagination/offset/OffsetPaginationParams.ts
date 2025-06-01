import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { z } from "zod/v4";

export interface OffsetPaginationParams<T extends string> extends BasePaginationParams<T> {
  offset?: number;
}

export const createOffsetPaginationParamsSchema = <T extends z.ZodType<string>>(sortKeySchema: T) =>
  z.object({
    ...createBasePaginationParamsSchema(sortKeySchema).shape,
    offset: z.int().nonnegative().default(0),
  });
