import type { PageSort } from "#src/models/pagination/PageSort";

import { encodedPageCursorSchema } from "#src/models/pagination/EncodedPageCursor";
import { pageLimitSchema } from "#src/models/pagination/PageLimit";
import { decodePageCursor } from "#src/services/pagination/decodePageCursor";
import { z } from "zod";

// The cursor parsed for the sort it continues: one that is not one value per key of that sort is a bad request
const parsePageCursor = (sort: PageSort) =>
  encodedPageCursorSchema.transform((cursor, context) => {
    const pageCursor = decodePageCursor(cursor, sort);
    if (!pageCursor) context.addIssue({ code: "custom", message: "Invalid cursor" });
    return pageCursor ?? z.NEVER;
  });
// What every paginated read takes: where to continue from, and how many items. A read extends it with its own filters
export const createPageInputSchema = (sort: PageSort) =>
  z.object({ cursor: parsePageCursor(sort), limit: pageLimitSchema });
// A read that offers a choice of order takes the name of one of its sorts, and its cursor is parsed for that sort
export const createSortedPageInputSchema = <TSortName extends string, TKey extends string>(
  sortNameSchema: z.ZodType<TSortName>,
  sorts: Record<TSortName, PageSort<TKey>>,
  defaultSortName: NoInfer<TSortName>,
) =>
  z
    .object({
      cursor: encodedPageCursorSchema,
      limit: pageLimitSchema,
      sortName: sortNameSchema.default(defaultSortName),
    })
    .transform(({ cursor, sortName, ...rest }, context) => {
      const sort = sorts[sortName];
      const pageCursor = decodePageCursor(cursor, sort);
      if (!pageCursor) {
        context.addIssue({ code: "custom", message: "Invalid cursor", path: ["cursor"] });
        return z.NEVER;
      }
      return { ...rest, cursor: pageCursor, sort, sortName };
    });
