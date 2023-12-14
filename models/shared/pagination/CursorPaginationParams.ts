import {
  createCommonPaginationParamsSchema,
  type CommonPaginationParams,
} from "@/models/shared/pagination/CommonPaginationParams";
import { CursorType } from "@/models/shared/pagination/CursorType";
import { z } from "zod";

export interface CursorPaginationParams<TCursor, TSortKey extends string> extends CommonPaginationParams<TSortKey> {
  cursor?: TCursor | null;
}

const uuidCursorSchema = z.string().uuid();
const serialCursorSchema = z.number().int().nonnegative();

export const createCursorPaginationParamsSchema = <
  TSortKeySchema extends z.ZodType<string>,
  TCursorType extends CursorType = CursorType.String,
>(
  sortKeySchema: TSortKeySchema,
  cursorType?: TCursorType,
) => {
  const cursorSchema = (cursorType === CursorType.Number
    ? serialCursorSchema
    : uuidCursorSchema) as unknown as z.ZodType<TCursorType extends CursorType.Number ? number : string>;
  return createCommonPaginationParamsSchema(sortKeySchema).merge(
    z.object({
      cursor: cursorSchema.nullable().default(null),
    }),
  );
};
