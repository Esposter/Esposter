import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { createSortItemSchema } from "#shared/models/pagination/sorting/SortItem";
import { DEFAULT_READ_LIMIT, MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { type } from "arktype";

export interface BasePaginationParams<TSortKey extends string> {
  limit?: number;
  sortBy?: SortItem<TSortKey>[];
}

export const createBasePaginationParamsSchema = <TSortKey extends string>(
  sortKeySchema: type.Any<TSortKey>,
  minSortBy = 0,
  defaultSortBy: SortItem<TSortKey>[] = [],
) =>
  type({
    limit: `0 < number.integer <= ${MAX_READ_LIMIT} = ${DEFAULT_READ_LIMIT}`,
    sortBy: createSortItemSchema(sortKeySchema)
      .array()
      .atLeastLength(minSortBy)
      .default(() => defaultSortBy),
  });
