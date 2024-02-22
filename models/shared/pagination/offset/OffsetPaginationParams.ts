import type { CommonPaginationParams } from "@/models/shared/pagination/CommonPaginationParams";
import { createCommonPaginationParamsSchema } from "@/models/shared/pagination/CommonPaginationParams";
import { z } from "zod";

export interface OffsetPaginationParams<TSortKey extends string> extends CommonPaginationParams<TSortKey> {
  offset?: number;
}

export const createOffsetPaginationParamsSchema = <TSortKeySchema extends z.ZodType<string>>(
  sortKeySchema: TSortKeySchema,
) =>
  createCommonPaginationParamsSchema(sortKeySchema).merge(
    z.object({
      offset: z.number().int().nonnegative().default(0),
    }),
  );
