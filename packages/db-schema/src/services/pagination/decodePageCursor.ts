import type { PageCursor } from "#src/models/pagination/PageCursor";
import type { PageSort } from "#src/models/pagination/PageSort";

import { pageCursorSchema, START_PAGE_CURSOR } from "#src/models/pagination/PageCursor";
import { getResult } from "@esposter/shared";
import { z } from "zod";

const pageCursorTupleSchema = z.tuple([pageCursorSchema.shape.isBackward, pageCursorSchema.shape.values]);
// The cursor read back at the boundary, for the sort it continues: anything that is not one number or string per key of
// That sort is undefined, which the read's input schema refuses as a bad request. A cursor carries no sort of its own, so
// One issued for another sort of the same width decodes, and only moves where the reader's own list starts
export const decodePageCursor = (cursor: string, sort: PageSort): PageCursor | undefined => {
  if (!cursor) return START_PAGE_CURSOR;

  const base64 = cursor.replaceAll("-", "+").replaceAll("_", "/");
  return getResult(() => atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")))
    .andThen((json) =>
      // oxlint-disable-next-line no-restricted-properties -- a cursor holds numbers and strings only, so no date-shaped string is revived
      getResult((): unknown => JSON.parse(json)),
    )
    .map((value) => pageCursorTupleSchema.safeParse(value))
    .match(
      (result) => {
        if (!result.success) return undefined;
        const [isBackward, values] = result.data;
        return values.length === sort.keys.length ? { isBackward, values } : undefined;
      },
      () => undefined,
    );
};
