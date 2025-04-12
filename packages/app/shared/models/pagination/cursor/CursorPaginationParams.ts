import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { createBasePaginationParamsSchema } from "#shared/models/pagination/BasePaginationParams";
import { type } from "arktype";

export interface CursorPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  // This will be a serialised string of all the cursors based on sorting
  cursor?: string;
}

export const createCursorPaginationParamsSchema = <TSortKey extends string>(
  sortKeySchema: type.Any<TSortKey>,
  defaultSortBy: SortItem<TSortKey>[],
) =>
  // We need at least one sort item so we can derive a primary cursor for pagination
  createBasePaginationParamsSchema(sortKeySchema, 1, defaultSortBy).merge(
    type({
      cursor: "string?",
    }),
  );
