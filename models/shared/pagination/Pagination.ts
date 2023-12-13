import { CursorType } from "@/models/shared/pagination/CursorType";
import type { SortItem } from "@/models/shared/pagination/SortItem";
import { createSortItemSchema } from "@/models/shared/pagination/SortItem";
import { DEFAULT_READ_LIMIT, MAX_READ_LIMIT } from "@/services/shared/pagination/constants";
import { z } from "zod";

export interface Pagination<TCursor, TSortKey extends string> {
  cursor?: TCursor | null;
  limit?: number;
  sortBy?: SortItem<TSortKey>[];
}

const uuidCursorSchema = z.string().uuid();
const serialCursorSchema = z.number().int().nonnegative();

export const createPaginationSchema = <
  TSortKeySchema extends z.ZodType<string>,
  TCursorType extends CursorType = CursorType.String,
>(
  sortKeySchema: TSortKeySchema,
  cursorType?: TCursorType,
) => {
  const cursorSchema = (cursorType === CursorType.Number
    ? serialCursorSchema
    : uuidCursorSchema) as unknown as z.ZodType<TCursorType extends CursorType.Number ? number : string>;
  return z.object({
    cursor: cursorSchema.nullable().default(null),
    limit: z.number().int().min(1).max(MAX_READ_LIMIT).default(DEFAULT_READ_LIMIT),
    sortBy: z.array(createSortItemSchema(sortKeySchema)).default([]),
  });
};
