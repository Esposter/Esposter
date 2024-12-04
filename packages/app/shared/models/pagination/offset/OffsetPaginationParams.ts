import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { z } from "zod";

export interface OffsetPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  offset?: number;
}

export const createOffsetPaginationParamsSchema = <TSortKeySchema extends z.ZodType<string>>(
  sortKeySchema: TSortKeySchema,
) =>
  createBasePaginationParamsSchema(sortKeySchema).merge(
    z.object({
      offset: z.number().int().nonnegative().default(0),
    }),
  );
