import {
  createCommonPaginationParamsSchema,
  type CommonPaginationParams,
} from "@/models/shared/pagination/CommonPaginationParams";
import { type SortItem } from "@/models/shared/pagination/sorting/SortItem";
import { z } from "zod";

export interface CursorPaginationParams<TSortKey extends string> extends CommonPaginationParams<TSortKey> {
  // This will be a serialised string of all the cursors based on sorting
  cursor?: string | null;
}

export const createCursorPaginationParamsSchema = <TSortKeySchema extends z.ZodType<string>>(
  sortKeySchema: TSortKeySchema,
  defaultSortBy: SortItem<TSortKeySchema["_type"]>[],
) =>
  // We need at least one sort item so we can derive a primary cursor for pagination
  createCommonPaginationParamsSchema(sortKeySchema, 1, defaultSortBy).merge(
    z.object({
      cursor: z.string().nullable().default(null),
    }),
  );
