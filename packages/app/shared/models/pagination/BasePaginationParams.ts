import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { sortItemScope } from "#shared/models/pagination/sorting/SortItem";
import { DEFAULT_READ_LIMIT, MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { scope } from "arktype";

export interface BasePaginationParams<TSortKey extends string> {
  limit?: number;
  sortBy?: SortItem<TSortKey>[];
}

export const createBasePaginationParamsScope = (minSortBy = 0) =>
  scope({
    "BasePaginationParams<TSortKey extends string>": {
      limit: `0 < number.integer <= ${MAX_READ_LIMIT} = ${DEFAULT_READ_LIMIT}`,
      sortBy: `sortItemScope.SortItem<TSortKey>[] >= ${minSortBy}`,
    },
    sortItemScope: sortItemScope.export(),
  });
