import type { BasePaginationParams } from "@/models/shared/pagination/BasePaginationParams";
import { createBasePaginationParamsSchema } from "@/models/shared/pagination/BasePaginationParams";
import { z } from "zod";

export interface OffsetPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  offset?: number;
}

export const createOffsetPaginationParamsSchema = <TSortKeySchema extends z.ZodType<string>>(
  sortKeySchema: TSortKeySchema,
) =>
  z
    .object({
      offset: z.number().int().nonnegative().default(0),
    })
    .merge(createBasePaginationParamsSchema(sortKeySchema));
