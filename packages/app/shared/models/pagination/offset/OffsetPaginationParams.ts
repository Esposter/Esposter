import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { type } from "arktype";

export interface OffsetPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  offset?: number;
}

export const createOffsetPaginationParamsSchema = <T extends string>(sortKeySchema: type.Any<T>) =>
  createBasePaginationParamsSchema(sortKeySchema).merge(
    type({
      offset: "number >= 0 = 0",
    }),
  );
