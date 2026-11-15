import type { Page, PageCursor, PageSort } from "@esposter/db-schema";

import { toPageCursorValue } from "#src/services/pagination/toPageCursorValue";
import { encodePageCursor } from "@esposter/db-schema";

// A read asks for one row past its limit, and that row is the whole answer to whether the list goes on: the page drops it
// And continues from the last row it keeps, never from the dropped one, which the next read answers. A backward read's
// Rows arrive in reverse and are turned back into the list's order, and its cursor keeps reading backward
export const toPage = <TKey extends string, TItem extends Record<TKey, unknown>>(
  rows: TItem[],
  { keys }: PageSort<TKey>,
  { isBackward }: PageCursor,
  limit: number,
): Page<TItem> => {
  const pageRows = rows.slice(0, limit);
  const lastRow = pageRows.at(-1);
  const nextCursor =
    rows.length > limit && lastRow
      ? encodePageCursor({ isBackward, values: keys.map((key) => toPageCursorValue(lastRow[key])) })
      : "";
  return { items: isBackward ? pageRows.toReversed() : pageRows, nextCursor };
};
