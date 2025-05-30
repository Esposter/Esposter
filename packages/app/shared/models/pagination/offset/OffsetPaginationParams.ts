import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { z } from "zod/v4";

export interface OffsetPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  offset?: number;
}

export const createOffsetPaginationParamsSchema = <TSortKey extends string>(sortKeySchema: z.ZodType<TSortKey>) =>
  z.object({
    ...createBasePaginationParamsSchema(sortKeySchema).shape,
    offset: z.int().nonnegative().default(0),
  });
