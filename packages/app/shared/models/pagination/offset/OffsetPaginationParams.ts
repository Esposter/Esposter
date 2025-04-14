import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { z } from "zod";

export interface OffsetPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  offset?: number;
}

export const createOffsetPaginationParamsSchema = <TSortKey extends string>(sortKeySchema: z.ZodType<TSortKey>) =>
  createBasePaginationParamsSchema(sortKeySchema).extend(
    z.interface({
      offset: z.int().nonnegative().default(0),
    }),
  );
